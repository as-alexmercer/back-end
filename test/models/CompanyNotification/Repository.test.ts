import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import {
  ApprovedOfferCompanyNotification,
  INewJobApplicationNotificationAttributes,
  NewJobApplicationCompanyNotification,
  IApprovedOfferNotificationAttributes,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { IAttributes } from "$models/CompanyNotification/CompanyNotification";
import { UUID } from "$models/UUID";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { CompanyNotification } from "$models/CompanyNotification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { TNotification } from "$models/Notification/Model";
import { Admin, Company, JobApplication, Offer } from "$models";
import {
  CompanyNotificationNotFoundError,
  CompanyNotificationsNotUpdatedError
} from "$models/CompanyNotification/Errors";

import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { OfferGenerator } from "$generators/Offer";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { UUID_REGEX } from "$test/models";

describe("CompanyNotificationRepository", () => {
  let extensionAdmin: Admin;
  let company: Company;
  let offer: Offer;
  let jobApplication: JobApplication;
  let commonAttributes: IAttributes;
  let newApplicationAttributes: INewJobApplicationNotificationAttributes;
  let approvedOfferAttributes: IApprovedOfferNotificationAttributes;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
    extensionAdmin = await AdminGenerator.extension();
    company = await CompanyGenerator.instance.withMinimumData();
    offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
    jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
    commonAttributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      isNew: true
    };
    newApplicationAttributes = { ...commonAttributes, jobApplicationUuid: jobApplication.uuid };
    approvedOfferAttributes = { ...commonAttributes, offerUuid: offer.uuid };
  });

  const expectToThrowErrorOnForeignKeyConstraint = async (attributeName: string) => {
    const attributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true
    };
    attributes[attributeName] = UUID.generate();
    const notification = new NewJobApplicationCompanyNotification(attributes);
    await expect(CompanyNotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "CompanyNotifications" violates foreign key ' +
        `constraint "CompanyNotifications_${attributeName}_fkey"`
    );
  };

  const expectToSaveAValidNotification = async (notification: TNotification) => {
    await CompanyNotificationRepository.save(notification);
    const savedNotification = await CompanyNotificationRepository.findByUuid(notification.uuid!);
    expect(savedNotification).toEqual(notification);
    expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    expect(notification.createdAt).toEqual(expect.any(Date));
  };

  const expectToSetUuidAndCreatedAtAfterSave = async (notification: TNotification) => {
    expect(notification.uuid).toBeUndefined();
    expect(notification.createdAt).toBeUndefined();
    await CompanyNotificationRepository.save(notification);
    expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    expect(notification.createdAt).toEqual(expect.any(Date));
  };

  const expectToUpdateIsNewAttribute = async (notification: TNotification) => {
    await CompanyNotificationRepository.save(notification);
    const uuid = notification.uuid!;
    expect(notification.isNew).toBe(true);
    notification.isNew = false;
    await CompanyNotificationRepository.save(notification);
    const persistedNotification = await CompanyNotificationRepository.findByUuid(uuid);
    expect(persistedNotification.isNew).toBe(false);
  };

  const expectToThrowErrorOnUniqueConstraint = async (notification: TNotification) => {
    const uuid = UUID.generate();
    jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
    await CompanyNotificationRepository.save(notification);
    expect(notification.uuid).toEqual(uuid);
    const anotherNotification = new NewJobApplicationCompanyNotification(newApplicationAttributes);
    await expect(
      CompanyNotificationRepository.save(anotherNotification)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  };

  it("saves a NewJobApplicationCompanyNotification in the database", async () => {
    const notification = new NewJobApplicationCompanyNotification(newApplicationAttributes);
    await expectToSaveAValidNotification(notification);
  });

  it("saves a ApprovedOfferCompanyNotification in the database", async () => {
    const notification = new ApprovedOfferCompanyNotification(approvedOfferAttributes);
    await expectToSaveAValidNotification(notification);
  });

  it("sets an uuid and a createdAt after it is persisted for a NewJobApplicationCompanyNotification", async () => {
    const notification = new NewJobApplicationCompanyNotification(newApplicationAttributes);
    await expectToSetUuidAndCreatedAtAfterSave(notification);
  });

  it("sets an uuid and a createdAt after it is persisted for a ApprovedOfferCompanyNotification", async () => {
    const notification = new ApprovedOfferCompanyNotification(approvedOfferAttributes);
    await expectToSetUuidAndCreatedAtAfterSave(notification);
  });

  it("updates isNew to false for NewJobApplicationCompanyNotification", async () => {
    const notification = new NewJobApplicationCompanyNotification(newApplicationAttributes);
    await expectToUpdateIsNewAttribute(notification);
  });

  it("updates isNew to false for ApprovedOfferCompanyNotification", async () => {
    const notification = new ApprovedOfferCompanyNotification(approvedOfferAttributes);
    await expectToUpdateIsNewAttribute(notification);
  });

  it("throws an error if a NewJobApplicationCompanyNotification already exist", async () => {
    const notification = new NewJobApplicationCompanyNotification(newApplicationAttributes);
    await expectToThrowErrorOnUniqueConstraint(notification);
  });

  it("throws an error if a ApprovedOfferCompanyNotification already exist", async () => {
    const notification = new ApprovedOfferCompanyNotification(approvedOfferAttributes);
    await expectToThrowErrorOnUniqueConstraint(notification);
  });

  it("throw an error if the jobApplicationUuid does not belong to an existing one", async () => {
    await expectToThrowErrorOnForeignKeyConstraint("jobApplicationUuid");
  });

  it("throw an error if the moderatorUuid does not belong to an existing admin", async () => {
    await expectToThrowErrorOnForeignKeyConstraint("moderatorUuid");
  });

  it("throw an error if the notifiedCompanyUuid does not belong to an existing company", async () => {
    await expectToThrowErrorOnForeignKeyConstraint("notifiedCompanyUuid");
  });

  it("throws an error if the uuid does not belong to a persisted notification", async () => {
    const uuid = UUID.generate();
    await expect(CompanyNotificationRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      CompanyNotificationNotFoundError,
      CompanyNotificationNotFoundError.buildMessage(uuid)
    );
  });

  describe("hasUnreadNotifications", () => {
    beforeEach(() => CompanyNotificationRepository.truncate());

    it("returns true if there are unread notifications", async () => {
      const size = 4;
      const companyUuid = company.uuid;
      const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
      let isNew = true;
      for (const notification of notifications) {
        notification.isNew = !isNew;
        isNew = !isNew;
        await CompanyNotificationRepository.save(notification);
      }
      expect(await CompanyNotificationRepository.hasUnreadNotifications({ companyUuid })).toBe(
        true
      );
    });

    it("returns false if all notifications were read", async () => {
      const size = 4;
      const companyUuid = company.uuid;
      const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
      notifications.map(notification => (notification.isNew = false));
      await Promise.all(notifications.map(n => CompanyNotificationRepository.save(n)));
      expect(await CompanyNotificationRepository.hasUnreadNotifications({ companyUuid })).toBe(
        false
      );
    });

    it("returns false there is no notifications", async () => {
      const companyUuid = company.uuid;
      expect(await CompanyNotificationRepository.hasUnreadNotifications({ companyUuid })).toBe(
        false
      );
    });
  });

  describe("markAsReadByUuids", () => {
    it("updates isNew to false for all given notification uuids", async () => {
      const size = 4;
      const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
      expect(notifications.map(({ isNew }) => isNew)).toEqual(Array(size).fill(true));

      const uuids = notifications.map(({ uuid }) => uuid!);
      await CompanyNotificationRepository.markAsReadByUuids(uuids);
      const updatedNotifications = await CompanyNotificationRepository.findByUuids(uuids);
      expect(updatedNotifications.map(({ isNew }) => isNew)).toEqual(Array(size).fill(false));
    });

    it("throws an error if one of the given uuids does not exist", async () => {
      const generator = CompanyNotificationGenerator.instance.newJobApplication;
      const notification = await generator({ company, admin: extensionAdmin });
      const nonExistentUuid = UUID.generate();
      const uuids = [notification.uuid!, nonExistentUuid];
      await expect(
        CompanyNotificationRepository.markAsReadByUuids(uuids)
      ).rejects.toThrowErrorWithMessage(
        CompanyNotificationsNotUpdatedError,
        CompanyNotificationsNotUpdatedError.buildMessage()
      );
    });

    it("does not update the notifications if it throws an error", async () => {
      const generator = CompanyNotificationGenerator.instance.newJobApplication;
      const notification = await generator({ company, admin: extensionAdmin });
      const uuid = notification.uuid!;
      const nonExistentUuid = UUID.generate();
      const uuids = [uuid, nonExistentUuid];
      await expect(CompanyNotificationRepository.markAsReadByUuids(uuids)).rejects.toThrowError();
      const persistedNotification = await CompanyNotificationRepository.findByUuid(uuid);
      expect(persistedNotification.isNew).toEqual(true);
    });
  });

  describe("findLatestByUser", () => {
    let notifications: CompanyNotification[] = [];
    const notificationsLength = 20;

    beforeAll(async () => {
      await CompanyNotificationRepository.truncate();

      const size = notificationsLength;
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();

      notifications = await CompanyNotificationGenerator.instance.range({ company, size });
      await CompanyNotificationGenerator.instance.range({ company: anotherCompany, size: 2 });
    });

    it("finds all notifications by company", async () => {
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid
      });
      expect(results).toHaveLength(notificationsLength);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the first three notifications", async () => {
      const itemsPerPage = 3;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[0].createdAt!,
        uuid: notifications[0].uuid!
      };
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid,
        updatedBeforeThan
      });
      expect(results).toHaveLength(itemsPerPage);
      expect(shouldFetchMore).toBe(true);
    });

    it("finds the last half of remaining notifications", async () => {
      const itemsPerPage = notificationsLength / 2;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[itemsPerPage - 1].createdAt!,
        uuid: notifications[itemsPerPage - 1].uuid!
      };
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid,
        updatedBeforeThan
      });
      expect(results).toHaveLength(itemsPerPage);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the latest notifications order by inNew first", async () => {
      let isNew = true;
      notifications.forEach(notification => {
        notification.isNew = !isNew;
        isNew = !isNew;
      });
      await Promise.all(
        notifications.map(notification => CompanyNotificationRepository.save(notification))
      );
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid
      });
      expect(results.map(result => result.isNew)).toEqual([
        ...Array(notificationsLength / 2).fill(true),
        ...Array(notificationsLength / 2).fill(false)
      ]);
      expect(shouldFetchMore).toBe(false);
    });
  });

  describe("Delete Cascade", () => {
    const newJobApplicationProps = () => ({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true
    });

    const approvedOfferProps = () => ({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      offerUuid: offer.uuid,
      isNew: true
    });

    it("deletes all notifications if JobApplications table is truncated", async () => {
      await CompanyNotificationRepository.truncate();
      const firstNotification = new NewJobApplicationCompanyNotification(newJobApplicationProps());
      const secondNotification = new NewJobApplicationCompanyNotification(newJobApplicationProps());
      await CompanyNotificationRepository.save(firstNotification);
      await CompanyNotificationRepository.save(secondNotification);
      expect(await CompanyNotificationRepository.findAll()).toHaveLength(2);
      await JobApplicationRepository.truncate();
      expect(await CompanyNotificationRepository.findAll()).toHaveLength(0);
    });

    it("deletes all notifications if Offers table is truncated", async () => {
      await CompanyNotificationRepository.truncate();
      const firstNotification = new ApprovedOfferCompanyNotification(approvedOfferProps());
      const secondNotification = new ApprovedOfferCompanyNotification(approvedOfferProps());
      await CompanyNotificationRepository.save(firstNotification);
      await CompanyNotificationRepository.save(secondNotification);
      expect(await CompanyNotificationRepository.findAll()).toHaveLength(2);
      await OfferRepository.truncate();
      expect(await CompanyNotificationRepository.findAll()).toHaveLength(0);
    });
  });
});