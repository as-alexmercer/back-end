import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { Admin } from "$models";

import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";

import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";

const UPDATE_CURRENT_COMPANY = gql`
  mutation(
    $companyName: String
    $slogan: String
    $description: String
    $logo: String
    $website: String
    $email: String
    $phoneNumbers: [String]
    $photos: [String]
  ) {
    updateCurrentCompany(
      companyName: $companyName
      slogan: $slogan
      description: $description
      logo: $logo
      website: $website
      email: $email
      phoneNumbers: $phoneNumbers
      photos: $photos
    ) {
      companyName
      slogan
      description
      logo
      website
      email
    }
  }
`;

describe("updateCurrentCompany", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();

    admin = await AdminGenerator.graduados();
  });

  const performQuery = (apolloClient: TestClient, variables?: object) =>
    apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: variables || {}
    });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin } });

  it("update all company attributes", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const dataToUpdate = {
      companyName: "Devartis SA",
      slogan: "new slogan",
      description: "new description",
      logo: "",
      website: "http://www.new-site.com",
      email: "old@devartis.com"
    };
    const { data, errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: dataToUpdate
    });
    expect(errors).toBeUndefined();
    expect(data!.updateCurrentCompany).toEqual(dataToUpdate);
  });

  it("allows a pending company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, { companyName: "Devartis SA" });
    expect(errors).toBeUndefined();
  });

  it("allows a rejected company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, { companyName: "Devartis SA" });
    expect(errors).toBeUndefined();
  });

  it("allows an approved company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, { companyName: "Devartis SA" });
    expect(errors).toBeUndefined();
  });

  it("throws an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const dataToUpdate = { companyName: "new company name" };
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: dataToUpdate
    });

    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("throws an error if current user is not a company user", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: {}
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
