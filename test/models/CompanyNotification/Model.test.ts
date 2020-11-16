import { ValidationError } from "sequelize";
import { CompanyNotification } from "$models";
import { CompanyNotificationType } from "$models/CompanyNotification";
import generateUuid from "uuid/v4";
import { omit } from "lodash";

describe("CompanyNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: generateUuid(),
    type: CompanyNotificationType.newJobApplication,
    companyUuid: generateUuid()
  };

  const expectToThrowErrorOnMissingAttribute = async (attributeName: string) => {
    const attributes = {
      moderatorUuid: generateUuid(),
      moderatorMessage: "message",
      type: CompanyNotificationType.newJobApplication,
      companyUuid: generateUuid(),
      isNew: false,
      jobApplicationUuid: generateUuid()
    };
    const companyNotification = new CompanyNotification(omit(attributes, attributeName));
    await expect(companyNotification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: CompanyNotification.${attributeName} cannot be null`
    );
  };

  it("creates a valid companyNotification", async () => {
    const attributes = {
      moderatorUuid: generateUuid(),
      moderatorMessage: "message",
      type: CompanyNotificationType.newJobApplication,
      companyUuid: generateUuid(),
      isNew: false,
      jobApplicationUuid: generateUuid()
    };
    const companyNotification = new CompanyNotification(attributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification).toBeObjectContaining(attributes);
  });

  it("is valid without a moderatorMessage", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.moderatorMessage).toBeUndefined();
  });

  it("is valid without a jobApplicationUuid", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.jobApplicationUuid).toBeUndefined();
  });

  it("is created with isNew set to true", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.isNew).toBe(true);
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error if no type is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("type");
  });

  it("throws an error if no companyUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("companyUuid");
  });
});
