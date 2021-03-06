import { nonNull, List, String } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { CompanyRepository } from "$models/Company";
import { EmailSenderFactory } from "$models/EmailSenderFactory";
import {
  UpdatedCompanyProfileNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";

export const updateCurrentCompany = {
  type: GraphQLCompany,
  args: {
    companyName: {
      type: nonNull(String)
    },
    businessSector: {
      type: nonNull(String)
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
    { phoneNumbers, photos, ...attributes }: IUpdateCurrentCompany,
    { currentUser }: IApolloServerContext
  ) => {
    const company = await CompanyRepository.findByUuid(currentUser.getCompanyRole().companyUuid);
    company.set(attributes);
    const notifications = UpdatedCompanyProfileNotificationFactory.create(company);

    await Database.transaction(async transaction => {
      await CompanyRepository.save(company, transaction);
      await CompanyPhotoRepository.update(photos, company, transaction);
      for (const notification of notifications) {
        const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
        await repository.save(notification, transaction);
      }
    });

    for (const notification of notifications) {
      const emailSender = EmailSenderFactory.create(notification);
      emailSender.send(notification);
    }

    return company;
  }
};

export interface IUpdateCurrentCompany {
  companyName: string;
  businessSector: string;
  slogan?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phoneNumbers?: string[];
  photos?: string[];
}
