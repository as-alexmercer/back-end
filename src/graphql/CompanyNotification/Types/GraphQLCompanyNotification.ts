import { GraphQLUnionType } from "graphql";
import { GraphQLNewJobApplicationCompanyNotification } from "./GraphQLNewJobApplicationCompanyNotification";
import { GraphQLApprovedOfferCompanyNotification } from "./GraphQLApprovedOfferCompanyNotification";
import { GraphQLRejectedOfferCompanyNotification } from "./GraphQLRejectedOfferCompanyNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  CompanyNotification,
  ApprovedOfferCompanyNotification,
  NewJobApplicationCompanyNotification,
  RejectedOfferCompanyNotification
} from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [
    GraphQLNewJobApplicationCompanyNotification,
    GraphQLApprovedOfferCompanyNotification,
    GraphQLRejectedOfferCompanyNotification
  ],
  resolveType(notification: CompanyNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case ApprovedOfferCompanyNotification.name:
        return GraphQLApprovedOfferCompanyNotification;
      case NewJobApplicationCompanyNotification.name:
        return GraphQLNewJobApplicationCompanyNotification;
      case RejectedOfferCompanyNotification.name:
        return GraphQLRejectedOfferCompanyNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
