import { Company, ICompany } from "./index";
import { CompanyPhoto, CompanyPhotoRepository } from "../CompanyPhoto";
import {
  CompanyPhoneNumber,
  CompanyPhoneNumberRepository
} from "../CompanyPhoneNumber";
import { CompanyNotFoundError } from "./Errors/CompanyNotFoundError";
import Database from "../../config/Database";

export const CompanyRepository = {
  create: async ({
    cuit,
    companyName,
    slogan,
    description,
    logo,
    website,
    email,
    phoneNumbers,
    photos
  }: ICompany) => {
    const company: Company = new Company({
      cuit,
      companyName,
      slogan,
      description,
      logo,
      website,
      email
    });
    const companyPhoneNumbers = CompanyPhoneNumberRepository.build(phoneNumbers);
    const companyPhotos = CompanyPhotoRepository.build(photos);
    return CompanyRepository.save(company, companyPhoneNumbers, companyPhotos);
  },
  save: async (
    company: Company,
    phoneNumbers: CompanyPhoneNumber[] = [],
    photos: CompanyPhoto[] = []
  ) => {
    const transaction = await Database.transaction();
    try {
      await company.save({ transaction: transaction });
      for (const phoneNumber of phoneNumbers) {
        phoneNumber.companyUuid = company.uuid;
        await phoneNumber.save({ transaction: transaction });
      }
      for (const photo of photos) {
        photo.companyUuid = company.uuid;
        await photo.save({ transaction: transaction });
      }
      await transaction.commit();
      return company;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  findByUuid: async (uuid: string) => {
    const company = await Company.findByPk(uuid);
    if (!company) throw new CompanyNotFoundError(uuid);

    return company;
  },
  findAll: async () => {
    return Company.findAll();
  },
  truncate: () => Company.truncate({ cascade: true })
};
