import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { RejectedOfferCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";
import { GraphQLSecretary } from "$graphql/Admin/Types/GraphQLSecretary";

export const GraphQLRejectedOfferCompanyNotification = new GraphQLObjectType<
  RejectedOfferCompanyNotification
>({
  name: "RejectedOfferCompanyNotification",
  fields: () => ({
    ...GraphQLGenericCompanyNotificationFields,
    moderatorMessage: {
      type: nonNull(String)
    },
    secretary: {
      type: nonNull(GraphQLSecretary)
    },
    offer: {
      type: nonNull(GraphQLOffer),
      resolve: notification => OfferRepository.findByUuid(notification.offerUuid)
    }
  })
});
