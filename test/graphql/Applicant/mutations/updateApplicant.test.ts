import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { ApplicantRepository } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

import { UserRepository } from "../../../../src/models/User/Repository";

const UPDATE_APPLICANT = gql`
  mutation updateApplicant(
    $uuid: ID!, $padron: Int, $user: UserUpdateInput, $description: String,
    $careers: [CareerCredits], $capabilities: [String], $sections: [SectionInput],
    $links: [LinkInput]
  ) {
    updateApplicant(
      uuid: $uuid, padron: $padron, user: $user, description: $description,
      careers: $careers, capabilities: $capabilities, sections: $sections, links: $links
    ) {
      user {
        uuid
        email
        name
        surname
      }
      padron
      description
      capabilities {
        description
      }
      careers {
        code
        description
        credits
        creditsCount
      }
      sections {
        uuid
        title
        text
        displayOrder
      }
      links {
        uuid
        name
        url
      }
    }
  }
`;

describe("updateApplicant", () => {
  const createApplicant = async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career]);
    return ApplicantRepository.create(applicantData);
  };

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await UserRepository.truncate();
  });

  beforeEach(() => UserRepository.truncate());

  afterAll(() => Database.close());

  it("should update all possible data deleting all previous values", async () => {
    const applicant = await createApplicant();
    const user = await applicant.getUser();
    const newCareer = await CareerRepository.create(careerMocks.careerData());
    const dataToUpdate = {
      uuid: applicant.uuid,
      user: {
        name: "newName",
        surname: "newSurname"
      },
      padron: applicant.padron,
      description: "newDescription",
      capabilities: ["CSS", "clojure"],
      careers: [
        {
          code: newCareer.code,
          creditsCount: 8
        }
      ],
      sections: [
        {
          title: "title",
          text: "description",
          displayOrder: 1
        }
      ],
      links: [
        {
          name: "my link",
          url: "https://some.url"
        }
      ]
    };

    const {
      data: { updateApplicant }, errors
    } = await executeMutation(UPDATE_APPLICANT, dataToUpdate);

    expect(errors).toBeUndefined();
    expect(updateApplicant).toMatchObject({
      padron: dataToUpdate.padron,
      user: {
        uuid: user.uuid,
        email: user.email,
        name: dataToUpdate.user.name,
        surname: dataToUpdate.user.surname
      },
      description: dataToUpdate.description
    });
    expect(
      updateApplicant.capabilities.map(c => c.description)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.capabilities
      ]
    ));
    expect(
      updateApplicant.careers.map(c => c.code)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.careers.map(c => c.code)
      ]
    ));
    expect(
      updateApplicant.sections.map(({ title, text, displayOrder }) =>
        ({ title, text, displayOrder })
      )
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.sections.map(({ title, text, displayOrder }) =>
          ({ title, text, displayOrder }))
      ]
    ));
    expect(
      updateApplicant.links.map(({ name, url }) => ({ name, url })
      )
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.links.map(({ name, url }) => ({ name, url }))
      ]
    ));
  });
});
