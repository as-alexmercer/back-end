import { isAdmin, isCompanyUser } from "$graphql/Rules";
import { isApprovedApplicant } from "$graphql/Rules/isApprovedApplicant";
import { or } from "graphql-shield";

export const companyPermissions = {
  Query: {
    getCompanies: isAdmin,
    getCompanyByUuid: or(isApprovedApplicant, isAdmin)
  },
  Mutation: {
    updateCurrentCompany: isCompanyUser,
    updateCompanyCriticalAttributes: isCompanyUser,
    updateCompanyApprovalStatus: isAdmin
  },
  Company: {
    users: or(isCompanyUser, isAdmin)
  }
};
