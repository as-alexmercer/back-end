import { Transaction } from "sequelize";
import { CompanyUser } from "$models";

export const CompanyUserRepository = {
  save: (companyUser: CompanyUser, transaction?: Transaction) => {
    return companyUser.save({ transaction });
  },
  findByCompanyUuid: (companyUuid: string) => CompanyUser.findAll({ where: { companyUuid } })
};
