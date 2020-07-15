import { List, nonNull } from "../../fieldTypes";
import { AdminTaskRepository, IAdminTasksFilter } from "../../../models/AdminTask";
import { GraphQLAdminTask } from "../Types/GraphQLAdminTask";
import { GraphQLAdminTaskType } from "../Types/GraphQLAdminTaskType";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";

export const getAdminTasks = {
  type: nonNull(List(GraphQLAdminTask)),
  args: {
    adminTaskTypes: {
      type: nonNull(List(GraphQLAdminTaskType))
    },
    statuses: {
      type: nonNull(List(GraphQLApprovalStatus))
    }
  },
  resolve: (_: undefined, filter: IAdminTasksFilter) =>
    AdminTaskRepository.find(filter)
};