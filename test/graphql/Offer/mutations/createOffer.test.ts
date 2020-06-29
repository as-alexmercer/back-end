import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { Database } from "../../../../src/config/Database";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { OfferGenerator, TOfferDataGenerator } from "../../../generators/Offer";
import { AdminGenerator } from "../../../generators/Admin";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { Admin } from "../../../../src/models/Admin";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
    mutation createOffer(
        $title: String!,
        $description: String!,
        $hoursPerDay: Int!,
        $minimumSalary: Int!,
        $maximumSalary: Int!,
        $sections: [OfferSectionInput],
        $careers: [OfferCareerInput]
    ) {
        createOffer(
            title: $title,
            description: $description,
            hoursPerDay: $hoursPerDay,
            minimumSalary: $minimumSalary,
            maximumSalary: $maximumSalary,
            sections: $sections,
            careers: $careers
        ) {
            uuid
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
            company {
              uuid
              cuit
              companyName
              slogan
              description
              logo
              website
              email
              phoneNumbers
              photos
            }
        }
    }
`;

const SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA = gql`
    mutation createOffer(
        $title: String!,
        $description: String!,
        $hoursPerDay: Int!,
        $minimumSalary: Int!,
        $maximumSalary: Int!
    ) {
        createOffer(
            title: $title,
            description: $description,
            hoursPerDay: $hoursPerDay,
            minimumSalary: $minimumSalary,
            maximumSalary: $maximumSalary
        ) {
            uuid
            title
            description
            hoursPerDay
            minimumSalary
            maximumSalary
        }
    }
`;

describe("createOffer", () => {
  let careers: TCareerGenerator;
  let offers: TOfferDataGenerator;
  let admin: Admin;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    offers = OfferGenerator.data.withObligatoryData();
    admin = await AdminGenerator.instance().next().value;
  });

  afterAll(() => Database.close());

  describe("when the input values are valid", () => {
    it("creates a new offer with only obligatory data", async () => {
      const { apolloClient, company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer).toHaveProperty("uuid");
      expect(data!.createOffer).toMatchObject(
        {
          title: createOfferAttributes.title,
          description: createOfferAttributes.description,
          hoursPerDay: createOfferAttributes.hoursPerDay,
          minimumSalary: createOfferAttributes.minimumSalary,
          maximumSalary: createOfferAttributes.maximumSalary
        }
      );
    });

    it("creates a new offer with one section and one career", async () => {
      const { apolloClient, company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const { code } = await careers.next().value;

      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: {
          ...createOfferAttributes,
          careers: [{ careerCode: code }],
          sections: [{
            title: "title",
            text: "text",
            displayOrder: 1
          }]
        }
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer.sections).toHaveLength(1);
      expect(data!.createOffer.careers).toHaveLength(1);
    });
  });

  describe("when the input values are invalid", () => {
    it("throws an error if no title is provided", async () => {
      const { apolloClient, company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const {
        companyUuid,
        title,
        ...createOfferAttributesWithNoTitle
      } = offers.next({ companyUuid: company.uuid }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributesWithNoTitle
      });
      expect(errors).not.toBeUndefined();
    });

    it("throws an error if no user is logged in", async () => {
      const { company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const apolloClient = client.loggedOut();
      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("throws an error if the current user is not a company", async () => {
      const { company } = await testClientFactory.company();
      const { apolloClient } = await testClientFactory.applicant();
      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the company has pending approval status", async () => {
      const { apolloClient, company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the company has rejected approval status", async () => {
      const { apolloClient, company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});