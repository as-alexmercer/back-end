import { DATE, UUID, TEXT, BOOLEAN, QueryInterface } from "sequelize";

const TABLE_NAME = "Notifications";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      applicantUuid: {
        allowNull: true,
        references: { model: "Applicants", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      userUuid: {
        allowNull: false,
        references: { model: "Users", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      adminUserUuid: {
        allowNull: false,
        references: { model: "Admins", key: "userUuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      isNew: {
        allowNull: false,
        type: BOOLEAN
      },
      message: {
        allowNull: true,
        type: TEXT
      },
      createdAt: {
        allowNull: false,
        type: DATE
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
