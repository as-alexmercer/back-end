import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../../src/models/Applicant";
import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

const deleteApplicantCareers = gql`
    mutation deleteApplicantCareers($padron: Int!, $careersCodes: [String!]) {
        deleteApplicantCareers(padron: $padron, careersCodes: $careersCodes) {
            name
            surname
            padron
            description
            capabilities {
                uuid
                description
            }
            careers {
                code
                description
                credits
                creditsCount
            }
        }
    }
`;


describe("deleteApplicantCareers", () => {

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("should delete all applicant careers", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const applicant = await ApplicantRepository.create(applicantData);
    const { data, errors } = await executeMutation(deleteApplicantCareers, {
      padron: applicant.padron,
      careersCodes: [career.code]
    });
    expect(errors).toBeUndefined();
    expect(data.deleteApplicantCareers.careers).toHaveLength(0);
  });

  it("should not delete applicant careers if it does not exists", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const applicant = await ApplicantRepository.create(applicantData);
    const { data, errors } = await executeMutation(deleteApplicantCareers, {
      padron: applicant.padron,
      careersCodes: ["undefined_code"]
    });
    expect(errors).toBeUndefined();
    expect(data.deleteApplicantCareers.careers)
      .toHaveLength(applicant.careers.length);
  });
});