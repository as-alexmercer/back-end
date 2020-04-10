import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { omit, pick } from "lodash";

const GET_OFFERS = gql`
    query {
        getOffers {
            uuid
            companyId
            title
            description
            hoursPerDay
            minimumSalary
            maximumSalary
            sections {
                uuid
                title
                text
                displayOrder
            }
            careers {
                code
                description
                credits
            }
        }
    }
`;

describe("getOffers", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  afterAll(() => Database.close());

  describe("when offers exists", () => {
    const createOffers = async ()  => {
      const { id } = await CompanyRepository.create(companyMockData);
      const career1 = await CareerRepository.create(careerMocks.careerData());
      const career2 = await CareerRepository.create(careerMocks.careerData());
      const offerAttributes1 = OfferMocks.withOneCareer(id, career1.code);
      const offerAttributes2 = OfferMocks.withOneCareer(id, career2.code);
      await OfferRepository.create(offerAttributes1);
      await OfferRepository.create(offerAttributes2);
      return { career1, career2, offerAttributes1, offerAttributes2 };
    };

    it("should return two offers if two offers were created", async () => {
      await createOffers();
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(2);
    });

    it("should return two offers when two offers exists", async () => {
      const { offerAttributes1, offerAttributes2 } = await createOffers();
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(2);
      expect(getOffers).toMatchObject(
        [
          omit(offerAttributes1, ["careers"]),
          omit(offerAttributes2, ["careers"])
        ]
      );
    });

    it("should return two offers with one career each", async () => {
      const {
        career1: { code: code1, description: description1, credits: credits1 },
        career2: { code: code2, description: description2, credits: credits2 }
      } = await createOffers();
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toMatchObject(
        [
          { careers: [ { code: code1, description: description1, credits: credits1 } ] },
          { careers: [ { code: code2, description: description2, credits: credits2 } ] }
        ]
      );
    });
  });

  describe("when no offers exists", () => {
    it("should return no offers when no offers were created", async () => {
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(0);
    });
  });
});
