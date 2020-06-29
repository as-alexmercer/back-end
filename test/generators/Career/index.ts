import { ICareer, Career, CareerRepository } from "../../../src/models/Career";
import { careerGenerator } from "./careerGenerator";
import { careerData } from "./careerData";
import { CustomGenerator } from "../types";

export type TCareerGenerator = CustomGenerator<Promise<Career>>;
export type TCareerDataGenerator = CustomGenerator<ICareer>;

export const CareerGenerator = {
  instance: (): TCareerGenerator => (
    careerGenerator<Promise<Career>>(
      (index: number) => CareerRepository.create(careerData(index))
    )
  ),
  data: (): TCareerDataGenerator =>
    careerGenerator<ICareer>(
      (index: number) => (careerData(index))
    )
};