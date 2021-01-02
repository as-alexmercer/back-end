import { isFromApprovedCompany, isCompanyUser } from "$graphql/Rules";

export const companyUserPermissions = {
  Query: {
    getCompanyUsers: isCompanyUser
  },
  Mutation: {
    saveCompanyUser: isCompanyUser,
    updatePassword: isFromApprovedCompany
  }
};
