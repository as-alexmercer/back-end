import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User";
import { Applicant } from "../../../../src/models/Applicant";
import { CompanyRepository } from "../../../../src/models/Company";
import { JobApplicationRepository } from "../../../../src/models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { OfferGenerator, TOfferGenerator } from "../../../generators/Offer";
import { ApplicantGenerator } from "../../../generators/Applicant";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_MY_LATEST_JOB_APPLICATIONS = gql`
    query getMyLatestJobApplications {
        getMyLatestJobApplications {
            createdAt
            offer {
                uuid
                title
            }
            applicant {
                uuid
                user {
                    name
                    surname
                }
            }
        }
    }
`;

describe("getMyLatestJobApplications", () => {
  let applicant: Applicant;
  let offers: TOfferGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    applicant = await ApplicantGenerator.withMinimumData().next().value;
    offers = await OfferGenerator.instance.withObligatoryData();
  });

  afterAll(() => Database.close());

  describe("when the input is valid", () => {
    it("returns all my company jobApplications", async () => {
      const { company, apolloClient } = await testClientFactory.company();
      const offer = await offers.next({ companyUuid: company.uuid }).value;
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);

      const { data, errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      const user = await applicant.getUser();
      expect(errors).toBeUndefined();
      expect(data!.getMyLatestJobApplications).toMatchObject(
        [
          {
            createdAt: jobApplication.createdAt.getTime().toString(),
            offer: {
              uuid: offer.uuid,
              title: offer.title
            },
            applicant: {
              uuid: applicant.uuid,
              user: {
                name: user.name,
                surname: user.surname
              }
            }
          }
        ]
      );
    });
  });

  describe("Errors", () => {
    it("should return an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("should return an error if current user is not a companyUser", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
