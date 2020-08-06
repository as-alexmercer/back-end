import { UniqueConstraintError, ValidationError } from "sequelize";
import { UserRepository } from "../../../src/models/User/Repository";
import { UserNotFoundError } from "../../../src/models/User";
import { UUID_REGEX } from "../index";
import {
  InvalidEmailError,
  PasswordWithoutDigitsError,
  PasswordWithoutUppercaseError
} from "validations-fiuba-laboral-v2";

describe("UserRepository", () => {
  beforeEach(() => UserRepository.truncate());

  describe("create", () => {
    it("creates a user", async () => {
      const userAttributes = {
        email: "asd@qwe.com",
        password: "AValidPassword123",
        name: "Sebastian",
        surname: "Blanco"
      };
      const user = await UserRepository.create(userAttributes);

      expect(user).toEqual(expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        email: userAttributes.email,
        name: userAttributes.name,
        surname: userAttributes.surname
      }));
    });

    it("creates a user with a dni", async () => {
      const dni = 30288888;
      const user = await UserRepository.create({
        email: "asd@qwe.com",
        password: "AValidPassword123",
        dni,
        name: "Sebastian",
        surname: "Blanco"
      });
      expect(user.dni).toEqual(dni);
    });

    it("throws an error if password is invalid", async () => {
      await expect(UserRepository.create({
        email: "asd@qwe.com",
        password: "an invalid password",
        name: "Sebastian",
        surname: "blanco"
      })).rejects.toThrowErrorWithMessage(
        PasswordWithoutUppercaseError,
        "La contraseña debe contener letras mayúsculas"
      );
    });

    it("throws error if email has invalid format", async () => {
      await expect(UserRepository.create({
        email: "asd@qwecom",
        password: "AValidPassword123",
        name: "Sebastian",
        surname: "blanco"
      })).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidEmailError.buildMessage("asd@qwecom")
      );
    });

    it("throws an error when creating an user with an existing email", async () => {
      const email = "asd@qwe.com";
      await UserRepository.create({
        email: email,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });
      await expect(
        UserRepository.create({
          email: email,
          password: "somethingVerySecret123",
          name: "name",
          surname: "surname"
        })
      ).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    });

    it("throws an error when creating an user with an existing dni", async () => {
      const dni = 39207888;
      await UserRepository.create({
        email: "robert_johnson@gmail.com",
        password: "somethingVerySecret123",
        name: "Robert",
        dni,
        surname: "Johnson"
      });
      await expect(
        UserRepository.create({
          email: "eddie_boyd@gmail.com",
          password: "somethingVerySecret123",
          name: "Eddie",
          dni,
          surname: "Boyd"
        })
      ).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    });

    it("checks for password validity before creation", async () => {
      await expect(
        UserRepository.create({
          email: "asd@qwe.com",
          password: "somethingWithoutDigits",
          name: "name",
          surname: "surname"
        })
      ).rejects.toThrowErrorWithMessage(
        PasswordWithoutDigitsError,
        "La contraseña debe contener numeros"
      );
    });
  });

  describe("findByEmail", () => {
    it("should find a user by email", async () => {
      await UserRepository.create({
        email: "bbb@bbb.com",
        password: "AValidPassword456",
        name: "Sebastian",
        surname: "blanco"
      });

      const emailToFind = "aaa@aaa.com";
      const userToFind = await UserRepository.create({
        email: emailToFind,
        password: "AValidPassword123",
        name: "Manuel",
        surname: "Llauro"
      });
      const foundUser = await UserRepository.findByEmail(emailToFind);

      expect(foundUser.email).toEqual(emailToFind);
      expect(foundUser.password).toEqual(userToFind.password);
    });

    it("returns error when it does not find a user with the given email", async () => {
      await UserRepository.create({
        email: "qqq@qqq.com",
        password: "AValidPassword789",
        name: "Sebastian",
        surname: "Blanco"
      });
      await UserRepository.create({
        email: "www@www.com",
        password: "AValidPassword012",
        name: "Dylan",
        surname: "Alvarez"
      });
      await expect(
        UserRepository.findByEmail("yyy@yyy.com")
      ).rejects.toThrow(UserNotFoundError);
    });
  });
});
