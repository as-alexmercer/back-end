import { Database } from "$config";
import { IFindAll, IOffer } from "./Interface";
import { IOfferSection } from "./OfferSection";
import { IOfferCareer } from "./OfferCareer";
import { OfferNotFound, OfferNotUpdatedError } from "./Errors";
import { Offer, OfferCareer, OfferSection } from "$models";
import { Op } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";
import { ICreateOffer } from "$models/Offer/Interface";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { OfferApprovalEventRepository } from "./OfferApprovalEvent/Repository";

export const OfferRepository = {
  create: ({ careers = [], sections = [], ...attributes }: ICreateOffer) => {
    const offer = new Offer(attributes);
    return OfferRepository.save(offer, sections, careers);
  },
  update: async (offer: IOffer & { uuid: string }) => {
    const [, [updatedOffer]] = await Offer.update(
      {
        extensionApprovalStatus: ApprovalStatus.pending,
        graduadosApprovalStatus: ApprovalStatus.pending,
        ...offer
      },
      {
        where: { uuid: offer.uuid },
        returning: true
      }
    );
    if (!updatedOffer) throw new OfferNotUpdatedError(offer.uuid);
    return updatedOffer;
  },
  updateApprovalStatus: async ({
    uuid,
    admin,
    status
  }: {
    uuid: string;
    admin: {
      secretary: Secretary;
      userUuid: string;
    };
    status: ApprovalStatus;
  }) =>
    Database.transaction(async transaction => {
      const offerAttributes = {
        ...(admin.secretary === Secretary.graduados && { graduadosApprovalStatus: status }),
        ...(admin.secretary === Secretary.extension && { extensionApprovalStatus: status })
      };

      const [, [updatedOffer]] = await Offer.update(offerAttributes, {
        where: { uuid },
        returning: true,
        transaction
      });
      if (!updatedOffer) throw new OfferNotUpdatedError(uuid);

      await OfferApprovalEventRepository.create({
        adminUserUuid: admin.userUuid,
        offer: updatedOffer,
        status: status,
        transaction
      });
      return updatedOffer;
    }),
  save: async (offer: Offer, sections: IOfferSection[], offersCareers: IOfferCareer[]) =>
    Database.transaction(async transaction => {
      await offer.save({ transaction });
      await Promise.all(
        sections.map(section =>
          OfferSection.create({ ...section, offerUuid: offer.uuid }, { transaction })
        )
      );
      await Promise.all(
        offersCareers.map(({ careerCode }) =>
          OfferCareer.create({ careerCode, offerUuid: offer.uuid }, { transaction })
        )
      );
      return offer;
    }),
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  },
  findAll: async ({ updatedBeforeThan, companyUuid, approvalStatuses }: IFindAll) => {
    const limit = PaginationConfig.itemsPerPage() + 1;
    const shouldHaveWhereClause = updatedBeforeThan || companyUuid || approvalStatuses;
    const whereClause = {
      where: {
        [Op.and]: [
          updatedBeforeThan && {
            [Op.or]: [
              {
                updatedAt: {
                  [Op.lt]: updatedBeforeThan.dateTime.toISOString()
                }
              },
              {
                updatedAt: updatedBeforeThan.dateTime.toISOString(),
                uuid: {
                  [Op.lt]: updatedBeforeThan.uuid
                }
              }
            ]
          },
          companyUuid && { companyUuid },
          approvalStatuses && {
            [Op.or]: [
              { graduadosApprovalStatus: approvalStatuses.graduadosApprovalStatus },
              { extensionApprovalStatus: approvalStatuses.extensionApprovalStatus }
            ]
          }
        ]
      }
    };
    const result = await Offer.findAll({
      ...(shouldHaveWhereClause && whereClause),
      order: [
        ["updatedAt", "DESC"],
        ["uuid", "DESC"]
      ],
      limit
    });
    return {
      shouldFetchMore: result.length === limit,
      results: result.slice(0, limit - 1)
    };
  },
  truncate: () => Offer.truncate({ cascade: true })
};
