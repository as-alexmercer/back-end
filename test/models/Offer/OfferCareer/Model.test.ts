import { ValidationError } from "sequelize";
import { OfferCareer } from "$models";
import { UUID } from "$models/UUID";

describe("OfferCareer", () => {
  const attributes = {
    offerUuid: UUID.generate(),
    careerCode: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    delete attributes[attribute];
    const section = new OfferCareer(attributes);
    await expect(section.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: OfferCareer.${attribute} cannot be null`
    );
  };

  it("creates a valid offer career", async () => {
    const offerCareer = new OfferCareer(attributes);
    await expect(offerCareer.validate()).resolves.not.toThrow();
    expect(offerCareer).toBeObjectContaining(attributes);
  });

  it("throws an error if no careerCode is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("careerCode");
  });

  it("throws an error if no offerUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("offerUuid");
  });
});
