import { SystemUser } from "$models/User";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";
import {
  InvalidEmailError,
  NameWithDigitsError,
  EmptyNameError,
  PasswordWithoutDigitsError,
  PasswordWithoutUppercaseError
} from "validations-fiuba-laboral-v2";

describe("SystemUser", () => {
  const mandatoryAttributes = {
    name: "name",
    surname: "surname",
    email: "email@fi.uba.ar",
    password: "somethingVerySecret123"
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  it("creates a valid SystemUser", () => {
    const fiubaUser = new SystemUser(mandatoryAttributes);
    const { password, ...attributes } = mandatoryAttributes;
    expect(fiubaUser).toBeObjectContaining(attributes);
  });

  it("creates a SystemUser with a hashed password", () => {
    const fiubaUser = new SystemUser(mandatoryAttributes);
    const { password } = mandatoryAttributes;
    expect(fiubaUser.password).not.toEqual(password);
  });

  it("creates a valid SystemUser with an uuid", () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const fiubaUser = new SystemUser(attributes);
    expect(fiubaUser.uuid).toEqual(uuid);
  });

  it("creates a valid notification with an undefined uuid", () => {
    const fiubaUser = new SystemUser(mandatoryAttributes);
    expect(fiubaUser.uuid).toBeUndefined();
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const fiubaUser = new SystemUser(mandatoryAttributes);
    expect(fiubaUser.uuid).toBeUndefined();
    fiubaUser.setUuid(uuid);
    expect(fiubaUser.uuid).toEqual(uuid);
  });

  it("throws an error if an uuid with invalid format is set", async () => {
    const fiubaUser = new SystemUser(mandatoryAttributes);
    expect(() => fiubaUser.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error no name is provided", async () => {
    expectToThrowErrorOnMissingAttribute("name");
  });

  it("throws an error no surname is provided", async () => {
    expectToThrowErrorOnMissingAttribute("surname");
  });

  it("throws an error no email is provided", async () => {
    expectToThrowErrorOnMissingAttribute("email");
  });

  it("throws an error no password is provided", async () => {
    expectToThrowErrorOnMissingAttribute("password");
  });

  it("throws an error the uuid has invalid format", async () => {
    const attributes = { ...mandatoryAttributes, uuid: "invalidFormat" };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error the name has digits", async () => {
    const attributes = { ...mandatoryAttributes, name: "name1234" };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      NameWithDigitsError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error the name is empty", async () => {
    const attributes = { ...mandatoryAttributes, name: "" };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      EmptyNameError,
      EmptyNameError.buildMessage()
    );
  });

  it("throws an error the surname has digits", async () => {
    const attributes = { ...mandatoryAttributes, surname: "name1234" };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      NameWithDigitsError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error the surname is empty", async () => {
    const attributes = { ...mandatoryAttributes, surname: "" };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      EmptyNameError,
      EmptyNameError.buildMessage()
    );
  });

  it("throws an error the email has invalid format", async () => {
    const email = "invalidFormat";
    const attributes = { ...mandatoryAttributes, email };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      InvalidEmailError,
      InvalidEmailError.buildMessage(email)
    );
  });

  it("throws an error if the password has no digits", async () => {
    const password = "somethingWithoutDigits";
    const attributes = { ...mandatoryAttributes, password };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      PasswordWithoutDigitsError,
      "La contraseña debe contener numeros"
    );
  });

  it("throws an error if the password is invalid", async () => {
    const password = "an invalid password";
    const attributes = { ...mandatoryAttributes, password };
    expect(() => new SystemUser(attributes)).toThrowErrorWithMessage(
      PasswordWithoutUppercaseError,
      "La contraseña debe contener letras mayúsculas"
    );
  });
});
