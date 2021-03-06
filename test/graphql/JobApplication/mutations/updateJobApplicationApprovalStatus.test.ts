import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";

import { UserRepository } from "$models/User";
import {
  AdminCannotModerateJobApplicationError,
  JobApplicationRepository
} from "$models/JobApplication";
import { JobApplicationApprovalEventRepository } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { EmailService } from "$services/Email";

import { JobApplication } from "$models";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { MissingModeratorMessageError } from "$models/Notification";

import { TestClientGenerator } from "$generators/TestClient";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { UUID_REGEX } from "$test/models";

const UPDATE_JOB_APPLICATION_APPROVAL_STATUS = gql`
  mutation updateJobApplicationApprovalStatus(
    $uuid: ID!
    $approvalStatus: ApprovalStatus!
    $moderatorMessage: String
  ) {
    updateJobApplicationApprovalStatus(
      uuid: $uuid
      approvalStatus: $approvalStatus
      moderatorMessage: $moderatorMessage
    ) {
      offerUuid
      applicantUuid
      approvalStatus
    }
  }
`;

describe("updateJobApplicationApprovalStatus", () => {
  let jobApplicationForGraduados: JobApplication;
  let jobApplicationForExtension: JobApplication;
  const moderatorMessage = "moderatorMessage";

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();

    const generator = JobApplicationGenerator.instance.toBeModeratedBy;
    jobApplicationForGraduados = await generator(Secretary.graduados);
    jobApplicationForExtension = await generator(Secretary.extension);
  });

  beforeEach(async () => {
    await JobApplicationApprovalEventRepository.truncate();
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
  });

  const getJobApplication = (secretary: Secretary) => {
    if (secretary === Secretary.graduados) return jobApplicationForGraduados;
    return jobApplicationForExtension;
  };

  const expectToLogAnEventForStatus = async (secretary: Secretary, status: ApprovalStatus) => {
    const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
    const { uuid } = getJobApplication(secretary);
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: status, moderatorMessage }
    });

    expect(errors).toBeUndefined();
    const jobApplication = await JobApplicationRepository.findByUuid(uuid);
    expect(await jobApplication.getApprovalEvents()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        jobApplicationUuid: jobApplication.uuid,
        status,
        ...(status === ApprovalStatus.rejected && { moderatorMessage })
      })
    ]);
  };

  const expectToUpdateStatus = async (secretary: Secretary, approvalStatus: ApprovalStatus) => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { uuid } = getJobApplication(secretary);
    const { errors, data } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus, moderatorMessage }
    });

    expect(errors).toBeUndefined();
    expect(data!.updateJobApplicationApprovalStatus.approvalStatus).toEqual(approvalStatus);
  };

  it("allows extension admin to change status to pending", async () => {
    await expectToUpdateStatus(Secretary.extension, ApprovalStatus.pending);
  });

  it("allows extension admin to change status to approved", async () => {
    await expectToUpdateStatus(Secretary.extension, ApprovalStatus.approved);
  });

  it("allows extension admin to change status to rejected", async () => {
    await expectToUpdateStatus(Secretary.extension, ApprovalStatus.rejected);
  });

  it("allows graduados admin to change status to pending", async () => {
    await expectToUpdateStatus(Secretary.graduados, ApprovalStatus.pending);
  });

  it("allows graduados admin to change status to approved", async () => {
    await expectToUpdateStatus(Secretary.graduados, ApprovalStatus.approved);
  });

  it("allows graduados admin to change status to rejected", async () => {
    await expectToUpdateStatus(Secretary.graduados, ApprovalStatus.rejected);
  });

  it("logs an event after an extension admin sets status to pending", async () => {
    await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.pending);
  });

  it("logs an event after an extension admin sets status to approved", async () => {
    await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.approved);
  });

  it("logs an event after an extension admin sets status to rejected", async () => {
    await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.rejected);
  });

  it("logs an event after an graduados admin sets status to pending", async () => {
    await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.pending);
  });

  it("logs an event after an graduados admin sets status to approved", async () => {
    await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.approved);
  });

  it("logs an event after an graduados admin sets status to rejected", async () => {
    await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.rejected);
  });

  describe("Notifications", () => {
    beforeEach(async () => {
      await CompanyNotificationRepository.truncate();
      await ApplicantNotificationRepository.truncate();
    });

    const updateJobApplicationWithStatus = async (approvalStatus: ApprovalStatus) => {
      const secretary = Secretary.extension;
      const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
      const { uuid } = getJobApplication(secretary);
      const { data, errors } = await apolloClient.mutate({
        mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
        variables: { uuid, approvalStatus, moderatorMessage }
      });
      expect(errors).toBeUndefined();
      return { data, admin };
    };

    it("creates a notification for an applicant if the jobApplication is approved", async () => {
      const repository = ApplicantNotificationRepository;
      const { uuid, applicantUuid } = getJobApplication(Secretary.extension);
      const { admin } = await updateJobApplicationWithStatus(ApprovalStatus.approved);
      const { results } = await repository.findLatestByApplicant({ applicantUuid });
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicantUuid,
          isNew: true,
          jobApplicationUuid: uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("creates a notification for an applicant if the jobApplication is rejected", async () => {
      const repository = ApplicantNotificationRepository;
      const { uuid, applicantUuid } = getJobApplication(Secretary.extension);
      const { admin } = await updateJobApplicationWithStatus(ApprovalStatus.rejected);
      const { results } = await repository.findLatestByApplicant({ applicantUuid });
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicantUuid,
          moderatorMessage,
          isNew: true,
          jobApplicationUuid: uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("creates a notification for an applicant if the jobApplication is pending", async () => {
      const repository = ApplicantNotificationRepository;
      const { uuid, applicantUuid } = getJobApplication(Secretary.extension);
      const { admin } = await updateJobApplicationWithStatus(ApprovalStatus.pending);
      const { results } = await repository.findLatestByApplicant({ applicantUuid });
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicantUuid,
          isNew: true,
          jobApplicationUuid: uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("creates a notification for a company if the jobApplication is approved", async () => {
      const jobApplication = getJobApplication(Secretary.extension);
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      const { admin } = await updateJobApplicationWithStatus(ApprovalStatus.approved);
      const { results, shouldFetchMore } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: companyUuid,
          isNew: true,
          jobApplicationUuid: jobApplication.uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("does not create a notification for a company if the jobApplication is rejected", async () => {
      const jobApplication = getJobApplication(Secretary.extension);
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      await updateJobApplicationWithStatus(ApprovalStatus.rejected);
      const { results, shouldFetchMore } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });

    it("does not create a notification for a companyUser if the jobApplication is pending", async () => {
      const jobApplication = getJobApplication(Secretary.extension);
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      await updateJobApplicationWithStatus(ApprovalStatus.pending);
      const { results, shouldFetchMore } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });
  });

  it("returns an error no moderatorMessage is provided when rejecting the jobApplication", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { uuid } = getJobApplication(secretary);
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.rejected }
    });
    expect(errors).toEqualGraphQLErrorType(MissingModeratorMessageError.name);
  });

  it("returns an error if no user is logged in", async () => {
    const apolloClient = await client.loggedOut();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid: jobApplicationForGraduados.uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if an extension admin wants to moderate a jobApplication for graduados", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { uuid } = getJobApplication(Secretary.graduados);
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.approved }
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateJobApplicationError.name);
  });

  it("returns an error if no uuid is provided", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { approvalStatus: ApprovalStatus.approved }
    });
    expect(errors).not.toBeUndefined();
  });

  it("returns an error if no approvalStatus is provided", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid: jobApplicationForExtension.uuid }
    });
    expect(errors).not.toBeUndefined();
  });

  it("returns an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid: jobApplicationForGraduados.uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid: jobApplicationForExtension.uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
