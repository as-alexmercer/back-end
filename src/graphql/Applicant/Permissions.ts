import { isAdmin, isApplicant, isUser } from "$graphql/Rules";
import { or } from "graphql-shield";
import { isApprovedApplicant } from "$graphql/Rules/isApprovedApplicant";

export const applicantPermissions = {
  Query: {
    getApplicant: isUser,
    getApplicants: or(isApprovedApplicant, isAdmin),
    getApplicantEmails: isAdmin
  },
  Mutation: {
    updateCurrentApplicant: isApplicant,
    updateApplicantApprovalStatus: isAdmin,
    updatePadron: isApplicant
  }
};
