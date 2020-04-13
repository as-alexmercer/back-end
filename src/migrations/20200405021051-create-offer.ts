import { QueryInterface, DATE, UUID, TEXT, INTEGER } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return  queryInterface.createTable(
      "Offers",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID,
          defaultValue: uuid()
        },
        companyId: {
          allowNull: false,
          references: { model: "Companies", key: "id" },
          onDelete: "CASCADE",
          type: INTEGER
        },
        title: {
          allowNull: false,
          type: TEXT
        },
        description: {
          allowNull: false,
          type: TEXT
        },
        hoursPerDay: {
          allowNull: false,
          type: INTEGER
        },
        minimumSalary: {
          allowNull: false,
          type: INTEGER
        },
        maximumSalary: {
          allowNull: false,
          type: INTEGER
        },
        createdAt: {
          allowNull: false,
          type: DATE
        },
        updatedAt: {
          allowNull: false,
          type: DATE
        }
      }
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Offers");
  }
};