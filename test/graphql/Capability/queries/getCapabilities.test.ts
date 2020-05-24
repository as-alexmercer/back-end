import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { CapabilityRepository } from "../../../../src/models/Capability";
import { client } from "../../ApolloTestClient";

import { testClientFactory } from "../../../mocks/testClientFactory";

import { AuthenticationError } from "../../../../src/graphql/Errors";

const GET_CAPABILITIES = gql`
    query {
        getCapabilities {
            uuid
            description
        }
    }
`;

describe("getCapabilities", () => {
  beforeAll(() => {
    Database.setConnection();
    return CapabilityRepository.truncate();
  });

  afterAll(async () => {
    await CapabilityRepository.truncate();
    return Database.close();
  });

  it("brings all capabilities in the database", async () => {
    const { apolloClient } = await testClientFactory.user();
    const [java, python, ruby] = await Promise.all(
      ["java", "python", "ruby"].map(description =>
        CapabilityRepository.create({ description: description })
      )
    );
    const { data } = await apolloClient.query({ query: GET_CAPABILITIES });
    expect(data!.getCapabilities).toEqual(
      expect.arrayContaining(
        [
          { description: "java", uuid: java.uuid },
          { description: "python", uuid: python.uuid },
          { description: "ruby", uuid: ruby.uuid }
        ]
      )
    );
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;

      const { errors } = await apolloClient.query({ query: GET_CAPABILITIES });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
