import {
  CompanyNewJobApplicationNotification,
  CompanyApprovedOfferNotification
} from "$models/CompanyNotification";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export enum CompanyNotificationType {
  newJobApplication = "newJobApplication",
  approvedOffer = "approvedOffer"
}

export type TCompanyNotification =
  | CompanyNewJobApplicationNotification
  | CompanyApprovedOfferNotification;

export const companyNotificationTypeEnumValues = Object.keys(CompanyNotificationType);

export interface IFindLatestByCompany {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}

export interface IHasUnreadNotifications {
  companyUuid: string;
}
