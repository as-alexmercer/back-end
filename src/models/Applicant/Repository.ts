import { fn, where, col, Op, Transaction } from "sequelize";
import { ApplicantType, IApplicantEditable, IFindLatest, IFind } from "./Interface";
import { ApplicantNotFound } from "./Errors";
import { Database } from "$config";
import { ApplicantCareersRepository } from "./ApplicantCareer";
import { ApplicantCapabilityRepository } from "../ApplicantCapability";
import { ApplicantKnowledgeSectionRepository } from "./ApplicantKnowledgeSection";
import { ApplicantExperienceSectionRepository } from "./ApplicantExperienceSection";
import { ApplicantLinkRepository } from "./Link";
import { UserRepository } from "../User";
import { Applicant, ApplicantCareer, UserSequelizeModel } from "..";
import { PaginationQuery } from "../PaginationQuery";
import { Includeable } from "sequelize/types/lib/model";

const applicantCareersFilterBuilder = (careerCodes?: string[], applicantType?: ApplicantType) => {
  if (!careerCodes && !applicantType) return;
  return {
    model: ApplicantCareer,
    where: {
      ...(careerCodes && { careerCode: { [Op.in]: careerCodes } }),
      ...(applicantType === ApplicantType.graduate && { isGraduate: true }),
      ...(applicantType === ApplicantType.student && { isGraduate: false })
    },
    attributes: []
  };
};

const userFilterBuilder = (name?: string) => {
  if (name === undefined) return;
  const removeAccent = word => word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize = word => removeAccent(word).toLowerCase();
  const words = name
    .replace("\n", " ")
    .split(" ")
    .filter(word => word !== "");
  if (words.length === 0) return;
  return {
    model: UserSequelizeModel,
    where: {
      [Op.and]: words.map(word => ({
        [Op.or]: [
          where(fn("unaccent", fn("lower", col("name"))), {
            [Op.regexp]: `(^|[[:space:]])${normalize(word)}([[:space:]]|$)`
          }),
          where(fn("unaccent", fn("lower", col("surname"))), {
            [Op.regexp]: `(^|[[:space:]])${normalize(word)}([[:space:]]|$)`
          })
        ]
      }))
    },
    attributes: []
  };
};

export const ApplicantRepository = {
  save: (applicant: Applicant, transaction?: Transaction) => applicant.save({ transaction }),
  find: ({ name, applicantType, careerCodes }: IFind = {}) => {
    const include: Includeable[] = [];
    const userFilter = userFilterBuilder(name);
    const applicantCareersFilter = applicantCareersFilterBuilder(careerCodes, applicantType);
    if (userFilter) include.push(userFilter);
    if (applicantCareersFilter) include.push(applicantCareersFilter);
    return Applicant.findAll({ include });
  },
  findLatest: ({
    updatedBeforeThan,
    name,
    careerCodes,
    applicantType,
    noLimit
  }: IFindLatest = {}) => {
    const include: Includeable[] = [];
    const userFilter = userFilterBuilder(name);
    const applicantCareersFilter = applicantCareersFilterBuilder(careerCodes, applicantType);
    if (userFilter) include.push(userFilter);
    if (applicantCareersFilter) include.push(applicantCareersFilter);
    return PaginationQuery.findLatest({
      noLimit,
      updatedBeforeThan,
      query: options => Applicant.findAll(options),
      include
    });
  },
  findByUuid: async (uuid: string) => {
    const applicant = await Applicant.findByPk(uuid);
    if (!applicant) throw new ApplicantNotFound(uuid);

    return applicant;
  },
  findByUserUuidIfExists: async (userUuid: string) => Applicant.findOne({ where: { userUuid } }),
  findByUserUuid: async (userUuid: string) => {
    const applicant = await ApplicantRepository.findByUserUuidIfExists(userUuid);
    if (!applicant) throw new ApplicantNotFound(userUuid);

    return applicant;
  },
  findByPadron: async (padron: number) => {
    const applicant = await Applicant.findOne({ where: { padron } });
    if (!applicant) throw new ApplicantNotFound(padron);

    return applicant;
  },
  update: ({
    user: { name, surname, email } = {},
    description,
    uuid,
    knowledgeSections = [],
    experienceSections = [],
    links = [],
    capabilities: newCapabilities = [],
    careers = []
  }: IApplicantEditable) =>
    Database.transaction(async transaction => {
      const applicant = await ApplicantRepository.findByUuid(uuid);
      await applicant.set({ description });
      const user = await UserRepository.findByUuid(applicant.userUuid);
      if (name) user.name = name;
      if (surname) user.surname = surname;
      if (email) user.email = email;
      await UserRepository.save(user, transaction);
      await new ApplicantKnowledgeSectionRepository().update({
        sections: knowledgeSections,
        applicant,
        transaction
      });
      await new ApplicantExperienceSectionRepository().update({
        sections: experienceSections,
        applicant,
        transaction
      });
      await ApplicantLinkRepository.update(links, applicant, transaction);
      await ApplicantCareersRepository.update(careers, applicant, transaction);
      await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);
      await applicant.save({ transaction });
      return applicant;
    }),
  truncate: () => Applicant.truncate({ cascade: true })
};
