import { UserInputError } from "apollo-server";

import { GraphQLApplicant } from "./Types/Applicant";
import { nonNull, Int } from "../fieldTypes";
import {
  Applicant,
  ApplicantRepository,
  ApplicantSerializer
} from "../../models/Applicant";

const applicantQueries = {
  getApplicantByPadron: {
    type: GraphQLApplicant,
    args: {
      padron: {
        type: nonNull(Int)
      }
    },
    resolve: async (_: undefined, { padron }) => {
      try {
        const applicant: Applicant = await ApplicantRepository.findByPadron(padron);

        return applicant && ApplicantSerializer.serialize(applicant);
      } catch (e) {
        throw new UserInputError("Applicant Not found", { invalidArgs: padron });
      }
    }
  }
};

export default applicantQueries;
