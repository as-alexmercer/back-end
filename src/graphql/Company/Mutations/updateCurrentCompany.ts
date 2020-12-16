import { List, String } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { IUpdateCompany } from "$models/Company/Interface";
import { CompanyRepository } from "$models/Company";
import {
  UpdatedCompanyProfileNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";

export const updateCurrentCompany = {
  type: GraphQLCompany,
  args: {
    companyName: {
      type: String
    },
    slogan: {
      type: String
    },
    description: {
      type: String
    },
    logo: {
      type: String
    },
    website: {
      type: String
    },
    email: {
      type: String
    },
    phoneNumbers: {
      type: List(String)
    },
    photos: {
      type: List(String)
    }
  },
  resolve: async (
    _: undefined,
    { phoneNumbers, photos, ...attributes }: IUpdateCompany,
    { currentUser }: IApolloServerContext
  ) => {
    const company = await CompanyRepository.findByUuid(currentUser.getCompanyRole().companyUuid);
    company.set(attributes);
    const notifications = UpdatedCompanyProfileNotificationFactory.create(company);

    await Database.transaction(async transaction => {
      await CompanyRepository.save(company, transaction);
      for (const notification of notifications) {
        const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
        await repository.save(notification, transaction);
      }
    });
    return company;
  }
};
