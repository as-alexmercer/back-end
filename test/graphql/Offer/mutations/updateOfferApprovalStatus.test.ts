import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import { client } from "$test/graphql/ApolloTestClient";
import { EmailService } from "$services/Email";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import {
  ApprovedOfferCompanyNotification,
  CompanyNotificationRepository,
  RejectedOfferCompanyNotification
} from "$models/CompanyNotification";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Company, Offer } from "$models";
import { DateTimeManager } from "$libs/DateTimeManager";
import { MissingModeratorMessageError } from "$models/Notification";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { AdminCannotModerateOfferError, OfferNotFoundError } from "$models/Offer/Errors";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { IForAllTargets, OfferGenerator } from "$test/generators/Offer";
import { UUID } from "$models/UUID";
import { ApplicantType } from "$models/Applicant";
import { UUID_REGEX } from "$test/models";

const UPDATE_OFFER_APPROVAL_STATUS = gql`
  mutation UpdateOfferApprovalStatus(
    $uuid: ID!
    $approvalStatus: ApprovalStatus!
    $moderatorMessage: String
  ) {
    updateOfferApprovalStatus(
      uuid: $uuid
      approvalStatus: $approvalStatus
      moderatorMessage: $moderatorMessage
    ) {
      uuid
      extensionApprovalStatus
      graduadosApprovalStatus
      studentsExpirationDateTime
      graduatesExpirationDateTime
    }
  }
`;

describe("updateOfferApprovalStatus", () => {
  const moderatorMessage = "message";
  let offers: IForAllTargets;
  let company: Company;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    company = await CompanyGenerator.instance.withMinimumData();
    offers = await OfferGenerator.instance.forAllTargets({
      status: ApprovalStatus.pending,
      companyUuid: company.uuid
    });
  });

  beforeEach(async () => {
    await OfferApprovalEventRepository.truncate();
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
    company.set({ approvalStatus: ApprovalStatus.approved });
    await CompanyRepository.save(company);
  });

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_OFFER_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const expectToUpdateStatusAndExpirationDateAndLogEvent = async (
    newStatus: ApprovalStatus,
    secretary: Secretary,
    offer: Offer
  ) => {
    const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
    const { data, errors } = await performMutation(apolloClient, {
      uuid: offer.uuid,
      approvalStatus: newStatus,
      moderatorMessage
    });
    const changedStatusColumn = {
      [Secretary.graduados]: "graduadosApprovalStatus",
      [Secretary.extension]: "extensionApprovalStatus"
    }[secretary];

    const changedExpirationColumn = {
      [Secretary.graduados]: "graduatesExpirationDateTime",
      [Secretary.extension]: "studentsExpirationDateTime"
    }[secretary];

    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(secretary);

    const expirationDate = {
      [ApprovalStatus.approved]: DateTimeManager.daysFromNow(offerDurationInDays).toISOString(),
      [ApprovalStatus.rejected]: null,
      [ApprovalStatus.pending]: null
    }[newStatus];

    expect(errors).toBeUndefined();

    expect(data!.updateOfferApprovalStatus).toBeObjectContaining({
      uuid: offer.uuid,
      [changedStatusColumn]: newStatus,
      [changedExpirationColumn]: expirationDate
    });

    expect(await OfferApprovalEventRepository.findAll()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        offerUuid: offer.uuid,
        status: newStatus,
        ...(newStatus === ApprovalStatus.rejected && { moderatorMessage })
      })
    ]);
  };

  it("sets an offer for students to pending and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.extension,
      offers[ApplicantType.student]
    );
  });

  it("approves an offer for students and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.extension,
      offers[ApplicantType.student]
    );
  });

  it("rejects an offer for students and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.extension,
      offers[ApplicantType.student]
    );
  });

  it("sets an offer for both to pending and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.extension,
      offers[ApplicantType.both]
    );
  });

  it("approves offer for both and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.extension,
      offers[ApplicantType.both]
    );
  });

  it("rejects offer for both and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.extension,
      offers[ApplicantType.both]
    );
  });

  it("sets an offer for graduados to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.graduados,
      offers[ApplicantType.graduate]
    );
  });

  it("approves offer for graduados and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.graduados,
      offers[ApplicantType.graduate]
    );
  });

  it("rejects offer for graduados and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.graduados,
      offers[ApplicantType.graduate]
    );
  });

  it("sets an offer for both to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.graduados,
      offers[ApplicantType.both]
    );
  });

  it("approves offer for both and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.graduados,
      offers[ApplicantType.both]
    );
  });

  it("rejects offer for both and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.graduados,
      offers[ApplicantType.both]
    );
  });

  describe("Notifications", () => {
    const updateOffer = async (offer: Offer, secretary: Secretary, status: ApprovalStatus) => {
      const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
      const { errors } = await performMutation(apolloClient, {
        uuid: offer.uuid,
        approvalStatus: status,
        moderatorMessage
      });
      expect(errors).toBeUndefined();
      return { admin };
    };

    it("creates a notification for a company if the offer is approved", async () => {
      await CompanyNotificationRepository.truncate();
      const offer = offers[ApplicantType.student];
      const { admin } = await updateOffer(offer, Secretary.extension, ApprovalStatus.approved);
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: offer.companyUuid
      });
      const [result] = results;

      expect(result).toBeInstanceOf(ApprovedOfferCompanyNotification);
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          secretary: admin.secretary,
          notifiedCompanyUuid: offer.companyUuid,
          isNew: true,
          offerUuid: offer.uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("creates a notification for a company if the offer is rejected", async () => {
      await CompanyNotificationRepository.truncate();
      const offer = offers[ApplicantType.student];
      const { admin } = await updateOffer(offer, Secretary.extension, ApprovalStatus.rejected);
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: offer.companyUuid
      });
      const [result] = results;

      expect(shouldFetchMore).toBe(false);
      expect(result).toBeInstanceOf(RejectedOfferCompanyNotification);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          secretary: admin.secretary,
          notifiedCompanyUuid: offer.companyUuid,
          isNew: true,
          moderatorMessage,
          offerUuid: offer.uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("does not creates a notification for a company if the offer is pending", async () => {
      await CompanyNotificationRepository.truncate();
      const offer = offers[ApplicantType.student];
      await updateOffer(offer, Secretary.extension, ApprovalStatus.pending);
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: offer.companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });
  });

  it("returns an error if no moderatorMessage is provided when rejecting the offer", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.student].uuid,
      approvalStatus: ApprovalStatus.rejected
    });
    expect(errors).toEqualGraphQLErrorType(MissingModeratorMessageError.name);
  });

  it("returns an error if the offer is for graduates and the admin is from extension", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.graduate].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateOfferError.name);
  });

  it("returns an error if the offer is for students and the admin is from graduados", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.student].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateOfferError.name);
  });

  it("returns an error if the company's offer is rejected", async () => {
    company.set({ approvalStatus: ApprovalStatus.rejected });
    await CompanyRepository.save(company);
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateOfferError.name);
  });

  it("returns an error if the company's offer is pending", async () => {
    company.set({ approvalStatus: ApprovalStatus.pending });
    await CompanyRepository.save(company);
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateOfferError.name);
  });

  it("returns an error if no user is logged in", async () => {
    const { errors } = await performMutation(client.loggedOut(), {
      uuid: offers[ApplicantType.student].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the offer does not exist", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: UUID.generate(),
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotFoundError.name);
  });

  it("returns an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: "invalidApprovalStatus"
    });
    expect(errors).not.toBeUndefined();
  });
});
