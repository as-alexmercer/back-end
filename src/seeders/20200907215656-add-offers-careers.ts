import { QueryInterface } from "sequelize";
import { careerCodes } from "./constants/careerCodes";
import { uuids } from "./constants/uuids";

const createRecord = (careerCode: string, offerUuid: string) => ({
  careerCode: careerCode,
  offerUuid: offerUuid,
  createdAt: new Date(),
  updatedAt: new Date()
});

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("OffersCareers", [
      createRecord(careerCodes.IngenieriaCivil, uuids.offers.javaSemiSenior),
      createRecord(careerCodes.IngenieriaAgrimensura, uuids.offers.javaSemiSenior),
      createRecord(careerCodes.IngenieriaEnPetroleo, uuids.offers.javaSemiSenior),
      createRecord(careerCodes.IngenieriaIndustrial, uuids.offers.javaSenior),
      createRecord(careerCodes.IngenieriaElectronica, uuids.offers.javaSenior),
      createRecord(careerCodes.IngenieriaQuimica, uuids.offers.javaSenior),
      createRecord(careerCodes.IngenieriaNavalYMecanica, uuids.offers.javaJunior),
      createRecord(careerCodes.LicenciaturaEnAnalisisDeSistemas, uuids.offers.javaJunior),
      createRecord(careerCodes.Agrimensura, uuids.offers.rubySenior),
      createRecord(careerCodes.IngenieriaMecanica, uuids.offers.rubyJunior),
      createRecord(careerCodes.IngenieriaInformatica, uuids.offers.rubyJunior),
      createRecord(careerCodes.IngenieriaAlimentos, uuids.offers.rubyJunior),
      createRecord(careerCodes.IngenieriaElectricista, uuids.offers.rubySemiSenior)
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("OffersCareers", {});
  }
};
