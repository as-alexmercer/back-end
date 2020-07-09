import { withMinimumData } from "./withMinimumData";
import { IApplicant, ApplicantRepository } from "../../../src/models/Applicant";
import { CustomGenerator } from "../types";
import { GenericGenerator, TGenericGenerator } from "../GenericGenerator";
import { Admin, Applicant } from "../../../src/models";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";

export type TApplicantGenerator = CustomGenerator<Promise<Applicant>>;
export type TUpdateApplicantGenerator = TGenericGenerator<Promise<Applicant>, IUpdatedWithStatus>;
export type TApplicantDataGenerator = CustomGenerator<IApplicant>;
interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}

export const ApplicantGenerator = {
  instance: {
    withMinimumData: function*(): TApplicantGenerator {
      let index = 0;
      while (true) {
        yield ApplicantRepository.create(withMinimumData(index));
        index++;
      }
    },
    updatedWithStatus: async (): Promise<TUpdateApplicantGenerator> => {
      const generator = GenericGenerator<Promise<Applicant>, IUpdatedWithStatus>(
        async (index, variables) => {
          const applicant = await ApplicantRepository.create(withMinimumData(index));
          if (!variables) return applicant;
          const { admin, status } = variables;
          return ApplicantRepository.updateApprovalStatus(admin.userUuid, applicant.uuid, status);
        }
      );
      await generator.next();
      return generator;
    }
  },
  data: {
    minimum: function*(): TApplicantDataGenerator {
      let index = 0;
      while (true) {
        yield withMinimumData(index);
        index++;
      }
    }
  }
};
