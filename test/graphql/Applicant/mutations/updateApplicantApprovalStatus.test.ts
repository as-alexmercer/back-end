import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { ApplicantNotFound, ApplicantRepository } from "$models/Applicant";
import { Applicant } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApplicantApprovalEventRepository } from "$models/Applicant/ApplicantApprovalEvent";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";

import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";
import { UUID_REGEX } from "$test/models";

const UPDATE_APPLICANT_APPROVAL_STATUS = gql`
  mutation($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateApplicantApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      uuid
      approvalStatus
    }
  }
`;

describe("updateApplicantApprovalStatus", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await ApplicantRepository.truncate();
    await CompanyRepository.truncate();
  });

  beforeEach(() => ApplicantApprovalEventRepository.truncate());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_APPLICANT_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const updateApplicantWithStatus = async (newStatus: ApprovalStatus) => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const { admin, apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: applicant.uuid, approvalStatus: newStatus };
    const { data, errors } = await performMutation(apolloClient, dataToUpdate);
    return { data, errors, admin, applicant };
  };

  const expectApplicantToBeUpdatedWithStatus = async (newStatus: ApprovalStatus) => {
    const { applicant, data } = await updateApplicantWithStatus(newStatus);
    expect(data!.updateApplicantApprovalStatus).toEqual({
      uuid: applicant.uuid,
      approvalStatus: newStatus
    });
  };

  const expectToCreateANewEventWithStatus = async (newStatus: ApprovalStatus) => {
    const { errors, applicant, admin } = await updateApplicantWithStatus(newStatus);
    expect(errors).toBeUndefined();
    expect(await ApplicantApprovalEventRepository.findAll()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        applicantUuid: applicant.uuid,
        status: newStatus
      })
    ]);
  };

  it("approves an applicant", async () => {
    await expectApplicantToBeUpdatedWithStatus(ApprovalStatus.approved);
  });

  it("rejects an applicant", async () => {
    await expectApplicantToBeUpdatedWithStatus(ApprovalStatus.rejected);
  });

  it("creates a new event after approving an applicant", async () => {
    await expectToCreateANewEventWithStatus(ApprovalStatus.approved);
  });

  it("creates a new event after rejecting an applicant", async () => {
    await expectToCreateANewEventWithStatus(ApprovalStatus.rejected);
  });

  describe("Notifications", () => {
    it("creates a notification for an applicant if it gets approved", async () => {
      const findLatestByApplicant = ApplicantNotificationRepository.findLatestByApplicant;
      const { applicant, admin } = await updateApplicantWithStatus(ApprovalStatus.approved);
      const applicantUuid = applicant.uuid;
      const { results, shouldFetchMore } = await findLatestByApplicant({ applicantUuid });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicant.uuid,
          isNew: true,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("does not creates a notification for an applicant if it gets rejected", async () => {
      const findLatestByApplicant = ApplicantNotificationRepository.findLatestByApplicant;
      const { applicant } = await updateApplicantWithStatus(ApprovalStatus.rejected);
      const applicantUuid = applicant.uuid;
      const { results, shouldFetchMore } = await findLatestByApplicant({ applicantUuid });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });

    it("does not creates a notification for an applicant if it is set to pending", async () => {
      const findLatestByApplicant = ApplicantNotificationRepository.findLatestByApplicant;
      const { applicant } = await updateApplicantWithStatus(ApprovalStatus.pending);
      const applicantUuid = applicant.uuid;
      const { results, shouldFetchMore } = await findLatestByApplicant({ applicantUuid });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });
  });

  describe("Errors", () => {
    let applicant: Applicant;

    beforeAll(async () => {
      applicant = await ApplicantGenerator.instance.withMinimumData();
    });

    it("returns an error if no uuid is provided", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const dataToUpdate = { approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).not.toBeUndefined();
    });

    it("returns an error if no user is logged in", async () => {
      const apolloClient = client.loggedOut();
      const dataToUpdate = {
        uuid: applicant.uuid,
        approvalStatus: ApprovalStatus.approved
      };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if the current user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const dataToUpdate = {
        uuid: applicant.uuid,
        approvalStatus: ApprovalStatus.approved
      };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the current user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const dataToUpdate = {
        uuid: applicant.uuid,
        approvalStatus: ApprovalStatus.approved
      };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the applicant does not exists", async () => {
      const nonExistentApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await performMutation(apolloClient, {
        uuid: nonExistentApplicantUuid,
        approvalStatus: ApprovalStatus.approved
      });
      expect(errors).toEqualGraphQLErrorType(ApplicantNotFound.name);
    });

    it("returns an error if the approvalStatus is invalid", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const dataToUpdate = {
        uuid: applicant.uuid,
        approvalStatus: "invalidApprovalStatus"
      };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).not.toBeUndefined();
    });
  });
});
