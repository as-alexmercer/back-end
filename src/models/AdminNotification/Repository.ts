import { Transaction } from "sequelize";
import { PaginationQuery } from "$models/PaginationQuery";
import { AdminNotificationNotFoundError, AdminNotificationsNotUpdatedError } from "./Errors";
import { AdminNotificationMapper } from "./Mapper";
import { AdminNotification } from "./AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";
import { IFindLatestBySecretary, IHasUnreadNotifications } from "./Interfaces";
import { Database } from "$config";

export const AdminNotificationRepository = {
  save: async (notification: AdminNotification, transaction?: Transaction) => {
    const sequelizeModel = AdminNotificationMapper.toPersistenceModel(notification);
    await sequelizeModel.save({ transaction });
    notification.setUuid(sequelizeModel.uuid);
    notification.setCreatedAt(sequelizeModel.createdAt);
  },
  findLatestBySecretary: ({ secretary, updatedBeforeThan }: IFindLatestBySecretary) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { secretary },
      timestampKey: "createdAt",
      query: async options => {
        const notifications = await AdminNotificationSequelizeModel.findAll(options);
        return notifications.map(AdminNotificationMapper.toDomainModel);
      }
    }),
  markAsReadByUuids: (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedCount] = await AdminNotificationSequelizeModel.update(
        { isNew: false },
        { where: { uuid: uuids }, returning: false, validate: false, transaction }
      );
      if (updatedCount !== uuids.length) throw new AdminNotificationsNotUpdatedError();
    }),
  hasUnreadNotifications: async ({ secretary }: IHasUnreadNotifications) => {
    const [{ exists }] = await Database.query<Array<{ exists: boolean }>>(
      `
      SELECT EXISTS (
        SELECT *
         FROM "AdminNotifications"
         WHERE "AdminNotifications"."secretary" = '${secretary}'
         AND "AdminNotifications"."isNew" = true
       )
    `,
      { type: "SELECT" }
    );
    return exists;
  },
  findByUuid: async (uuid: string) => {
    const sequelizeModel = await AdminNotificationSequelizeModel.findByPk(uuid);
    if (!sequelizeModel) throw new AdminNotificationNotFoundError(uuid);

    return AdminNotificationMapper.toDomainModel(sequelizeModel);
  },
  findByUuids: async (uuids: string[]) => {
    const sequelizeModels = await AdminNotificationSequelizeModel.findAll({
      where: { uuid: uuids }
    });
    return sequelizeModels.map(AdminNotificationMapper.toDomainModel);
  },
  findAll: async () => {
    const notifications = await AdminNotificationSequelizeModel.findAll();
    return notifications.map(AdminNotificationMapper.toDomainModel);
  },
  truncate: () => AdminNotificationSequelizeModel.destroy({ truncate: true })
};
