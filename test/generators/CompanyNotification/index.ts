import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification,
  CompanyNotificationRepository,
  CompanyNotification
} from "$models/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { OfferGenerator } from "$generators/Offer";
import { Admin, Company } from "$models";
import { range, sample } from "lodash";
import MockDate from "mockdate";

export const CompanyNotificationGenerator = {
  instance: {
    newJobApplication: async ({ company, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const jobApplication = await JobApplicationGenerator.instance.toTheCompany(companyUuid);
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        jobApplicationUuid: jobApplication.uuid,
        isNew: true
      };
      const notification = new NewJobApplicationCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    approvedOffer: async ({ company, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        offerUuid: offer.uuid,
        isNew: true
      };
      const notification = new ApprovedOfferCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    rejectedOffer: async ({ company, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        offerUuid: offer.uuid,
        moderatorMessage: "message",
        isNew: true
      };
      const notification = new RejectedOfferCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    range: async ({ company, size }: { size: number; company: Company }) => {
      const admin = await AdminGenerator.extension();
      const values: CompanyNotification[] = [];
      const generators = [
        CompanyNotificationGenerator.instance.newJobApplication,
        CompanyNotificationGenerator.instance.approvedOffer,
        CompanyNotificationGenerator.instance.rejectedOffer
      ];
      for (const milliseconds of range(size)) {
        MockDate.set(milliseconds);
        const generator = sample<Generator>(generators);
        values.push(await generator!({ company, admin }));
        MockDate.reset();
      }
      return values.sort(({ createdAt }) => -createdAt!);
    }
  }
};

type Generator = (attributes: IGeneratorAttributes) => Promise<CompanyNotification>;

interface IGeneratorAttributes {
  company?: Company;
  admin?: Admin;
}
