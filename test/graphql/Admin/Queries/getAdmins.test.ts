import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import { AdminRepository, Secretary } from "$models/Admin";
import { Admin } from "$models";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";
import { ApplicantRepository } from "$src/models/Applicant";

const GET_ADMINS = gql`
  query getAdmins($updatedBeforeThan: PaginatedInput) {
    getAdmins(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        updatedAt
        createdAt
        secretary
        status
        user {
          email
          name
          surname
        }
      }
    }
  }
`;

describe("getAdmins", () => {
  let adminExtension: Admin;
  let adminGraduados: Admin;
  let apolloClientAdminExtension;
  let apolloClientAdminGraduados;

  beforeAll(async () => {
    await ApplicantRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await AdminRepository.truncate();
    ({
      admin: adminGraduados,
      apolloClient: apolloClientAdminGraduados
    } = await TestClientGenerator.admin({
      secretary: Secretary.graduados
    }));
    ({
      admin: adminExtension,
      apolloClient: apolloClientAdminExtension
    } = await TestClientGenerator.admin({
      secretary: Secretary.extension
    }));
  });

  describe("successful cases", () => {
    let adminExtraExtension: Admin;
    let deletedAdminExtraExtension: Admin;
    let adminExtraGraduados: Admin;
    let deletedAdminExtraGraduados: Admin;
    let allSortedAdmins;

    beforeAll(async () => {
      adminExtraExtension = await AdminGenerator.extension();
      adminExtraGraduados = await AdminGenerator.graduados();
      deletedAdminExtraExtension = await AdminGenerator.extension();
      await AdminRepository.delete(deletedAdminExtraExtension);
      deletedAdminExtraGraduados = await AdminGenerator.graduados();
      await AdminRepository.delete(deletedAdminExtraGraduados);
      allSortedAdmins = [
        deletedAdminExtraGraduados,
        deletedAdminExtraExtension,
        adminExtraGraduados,
        adminExtraExtension,
        adminExtension,
        adminGraduados
      ];

      allSortedAdmins = await Promise.all(
        allSortedAdmins.map(async admin => {
          const user = await UserRepository.findByUuid(admin.userUuid);
          return {
            user: {
              email: user.email,
              name: user.name,
              surname: user.surname
            },
            uuid: admin.userUuid,
            updatedAt: admin.updatedAt.toISOString(),
            createdAt: admin.createdAt.toISOString(),
            secretary: admin.secretary,
            status: admin.getStatus()
          };
        })
      );
    });

    it("fetches all admins for an admin from graduados", async () => {
      const { data, errors } = await apolloClientAdminGraduados.query({ query: GET_ADMINS });

      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toEqual(false);
      expect(data!.getAdmins.results).toEqual(allSortedAdmins);
    });

    it("fetches all admins for an admin from extension", async () => {
      const { data, errors } = await apolloClientAdminExtension.query({ query: GET_ADMINS });

      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toEqual(false);
      expect(data!.getAdmins.results).toEqual(allSortedAdmins);
    });

    it("supports pagination", async () => {
      const itemsPerPage = 2;
      mockItemsPerPage(itemsPerPage);
      const { data, errors } = await apolloClientAdminExtension.query({ query: GET_ADMINS });
      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toBe(true);
      expect(data!.getAdmins.results).toHaveLength(2);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved
      });
      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.approved
      });
      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
