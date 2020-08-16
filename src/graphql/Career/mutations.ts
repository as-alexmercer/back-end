import { GraphQLCareer } from "./Types/Career";
import { nonNull, String, ID } from "$graphql/fieldTypes";
import { ICareer, CareerRepository } from "$models/Career";

export const careerMutations = {
  saveCareer: {
    type: GraphQLCareer,
    args: {
      code: {
        type: nonNull(ID)
      },
      description: {
        type: nonNull(String)
      }
    },
    resolve: async (_: undefined, props: ICareer) => CareerRepository.create(props)
  }
};
