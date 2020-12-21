import { QueryInterface } from "sequelize";

const tableName = "Applicants";
const indexName = "applicants_admin_tasks_index";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "approvalStatus", order: "DESC" },
        { name: "updatedAt", order: "DESC" },
        { name: "uuid", order: "DESC" }
      ]
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName)
};
