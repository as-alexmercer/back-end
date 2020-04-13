import Database from "../../../src/config/Database";
import { CareerRepository } from "../../../src/models/Career";
import {
  Applicant,
  ApplicantRepository,
  Errors,
  IApplicantEditable
} from "../../../src/models/Applicant";
import { CareerApplicantRepository } from "../../../src/models/CareerApplicant/Repository";
import { CareerApplicantNotFound } from "../../../src/models/CareerApplicant/Errors";
import { CapabilityRepository } from "../../../src/models/Capability";
import { internet, random } from "faker";
import { Company } from "../../../src/models/Company";
import { Offer } from "../../../src/models/Offer";
import { companyMockData } from "../Company/mocks";
import { careerMocks } from "../Career/mocks";
import { capabilityMocks } from "../Capability/mocks";
import { applicantMocks } from "./mocks";
import { OfferMocks } from "../Offer/mocks";

describe("ApplicantRepository", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CareerApplicantRepository.truncate();
    await ApplicantRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();
  });

  afterAll(() => Database.close());

  describe("Create", () => {
    it("creates a new applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const applicant = await ApplicantRepository.create(applicantData);
      const applicantCareers = await applicant.getCareers();

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        name: applicantData.name,
        surname: applicantData.surname,
        padron: applicantData.padron,
        description: applicantData.description
      }));
      expect(applicantCareers[0]).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        CareerApplicant: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: applicantData.careers[0].creditsCount
        }
      });
      expect((await applicant.getCareers())[0].description).toEqual(career.description);
      expect(
        (await applicant.getCapabilities())[0].description
      ).toEqual(
        applicantData.capabilities[0]
      );
    });

    it("should create two valid applicant in the same career", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      await ApplicantRepository.create(applicantMocks.applicantData([career]));
      await expect(
        ApplicantRepository.create(applicantMocks.applicantData([career]))
      ).resolves.not.toThrow(Errors.ApplicantNotFound);
    });

    it("can create an applicant without a career and without capabilities", async () => {
      const applicantData = applicantMocks.applicantData([]);
      const savedApplicant = await ApplicantRepository.create({
        ...applicantData,
        capabilities: []
      });

      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

      expect(applicant).not.toBeNull();
    });

    describe("Transactions", () => {
      it("should rollback transaction and throw error if name is large", async () => {
        const career = await CareerRepository.create(careerMocks.careerData());
        const applicantData = applicantMocks.applicantData([career]);
        applicantData.name = "and the transaction will rolback because it is large";
        await expect(
          ApplicantRepository.create(applicantData)
        ).rejects.toThrow();
      });
    });
  });

  describe("Get", () => {
    it("can retreive an applicant by padron", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      await ApplicantRepository.create(applicantData);

      const applicant = await ApplicantRepository.findByPadron(applicantData.padron);

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        name: applicantData.name,
        surname: applicantData.surname,
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const applicantCareers = await applicant.getCareers();
      expect(applicantCareers[0]).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        CareerApplicant: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: applicantData.careers[0].creditsCount
        }
      });
      expect(
        (await applicant.getCapabilities())[0].description
      ).toEqual(
        applicantData.capabilities[0]
      );
    });

    it("can retrieve an applicant by uuid", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const savedApplicant = await ApplicantRepository.create(applicantData);

      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        name: applicantData.name,
        surname: applicantData.surname,
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const applicantCareers = await applicant.getCareers();
      expect(applicantCareers[0]).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        CareerApplicant: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: applicantData.careers[0].creditsCount
        }
      });
      expect(
        (await applicant.getCapabilities())[0].description
      ).toEqual(
        applicantData.capabilities[0]
      );
    });

    it("should throw ApplicantNotFound if the aplicant doesn't exists", async () => {
      const applicantData = applicantMocks.applicantData([]);

      await expect(ApplicantRepository.findByPadron(applicantData.padron))
      .rejects.toThrow(Errors.ApplicantNotFound);
    });
  });

  describe("Update", () => {
    const createApplicant = async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      return ApplicantRepository.create(applicantData);
    };

    it("Should update all props", async () => {
      const { uuid } = await createApplicant();
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        uuid,
        name: "newName",
        surname: "newSurname",
        description: "newDescription",
        capabilities: ["CSS", "clojure"],
        careers: [
          {
            code: newCareer.code,
            creditsCount: 8
          }
        ],
        sections: [
          {
            title: "title",
            text: "some description",
            displayOrder: 1
          }
        ],
        links: [
          {
            name: "someName",
            url: "https://some.url"
          }
        ]
      };
      const applicant = await ApplicantRepository.update(newProps);
      const capabilitiesDescription = [
        ...newProps.capabilities,
        ...(await applicant.getCapabilities()).map(capability => capability.description)
      ];
      const careersCodes = [
        ...(await applicant.getCareers()).map(career => career.code),
        newCareer.code
      ];
      expect(applicant).toMatchObject({
        name: newProps.name,
        surname: newProps.surname,
        description: newProps.description
      });

      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(
        capabilitiesDescription
      ));
      expect(
        (await applicant.getCareers()).map(aCareer => aCareer.code)
      ).toEqual(expect.arrayContaining(careersCodes));
    });

    it("Should update name", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        name: "newName"
      };
      const applicant = await ApplicantRepository.update(newProps);

      expect(applicant).toMatchObject({
        name: newProps.name
      });
    });

    it("Should update surname", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        surname: "newSurname"
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(applicant).toMatchObject({
        surname: newProps.surname
      });
    });

    it("Should update description", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        description: "newDescription"
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(applicant).toEqual(expect.objectContaining({
        description: newProps.description
      }));
    });

    it("Should update by adding new capabilities", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        capabilities: ["CSS", "clojure"]
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(["CSS", "clojure"]));
    });

    it("Should update by adding new careers", async () => {
      const applicant = await createApplicant();
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: newCareer.code,
            creditsCount: 8
          }
        ]
      };
      const careersBeforeUpdate = await applicant.getCareers();
      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getCareers()).map(career => career.code)
      ).toEqual(expect.arrayContaining([
        ...careersBeforeUpdate.map(career => career.code),
        newCareer.code
      ]));
    });

    it("Should update by adding new sections", async () => {
      const applicant = await createApplicant();

      const props: IApplicantEditable = {
        uuid: applicant.uuid,
        sections: [{
          title: "myTitle",
          text: "some description",
          displayOrder: 1
        }]
      };

      await ApplicantRepository.update(props);

      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        sections: [{
          title: "new myTitle",
          text: "new some description",
          displayOrder: 2
        }]
      };
      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getSections()).map(section => section.title)
      ).toEqual(expect.arrayContaining([
        ...props.sections.map(section => section.title),
        ...newProps.sections.map(section => section.title)
      ]));
    });

    it("Should update by adding new links", async () => {
      const applicant = await createApplicant();

      const props: IApplicantEditable = {
        uuid: applicant.uuid,
        links: [{
          name: random.word(),
          url: internet.url()
        }]
      };

      await ApplicantRepository.update(props);

      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        links: [{
          name: "new name",
          url: internet.url()
        }]
      };
      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getLinks()).map(link => link.name)
      ).toEqual(expect.arrayContaining([
        ...props.links.map(link => link.name),
        ...newProps.links.map(link => link.name)
      ]));
    });

    it("should not throw an error when adding an existing capability", async () => {
      const applicant = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        capabilities: [(await applicant.getCapabilities())[0].description]
      };
      await expect(ApplicantRepository.update(newProps)).resolves.not.toThrow();
    });

    it("Should update credits count of applicant careers", async () => {
      const applicant = await createApplicant();
      const [career] = await applicant.getCareers();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: career.code,
            creditsCount: 100
          }
        ]
      };
      await ApplicantRepository.update(newProps);

      const careerApplicant = await CareerApplicantRepository.findByApplicantAndCareer(
        applicant.uuid, career.code
      );
      expect(careerApplicant.creditsCount).toEqual(newProps.careers[0].creditsCount);
    });
  });

  describe("Delete", () => {
    it("should delete an applicant by uuid", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const savedApplicant = await ApplicantRepository.create(applicantData);

      await ApplicantRepository.deleteByUuid(savedApplicant.uuid);

      await expect(ApplicantRepository.findByUuid(savedApplicant.uuid))
        .rejects.toThrow(Errors.ApplicantNotFound);
    });

    it("should delete all applicant capabilities", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const capabilities = capabilityMocks.capabilitiesData({ size: 3 });
      const applicantData = applicantMocks.applicantData(
        [career],
        capabilities.map(c => c.description)
      );
      const applicant = await ApplicantRepository.create(applicantData);

      expect((await applicant.getCapabilities()).length).toEqual(capabilities.length);

      await ApplicantRepository.deleteCapabilities(
        applicant, capabilities.map(c => c.description)
      );
      expect((await applicant.getCapabilities()).length).toEqual(0);
    });

    it("should delete all applicant careers", async () => {
      const careers = await careerMocks.createTenCareers();
      const applicantData = applicantMocks.applicantData(careers);
      const applicant = await ApplicantRepository.create(applicantData);
      expect((await applicant.getCareers()).length).toEqual(careers.length);
      await ApplicantRepository.deleteCareers(applicant, careers.map(({ code }) => code));
      expect((await applicant.getCareers()).length).toEqual(0);
    });

    it("should delete a section of an applicant", async () => {
      const careers = await careerMocks.createTenCareers();
      const applicantData = applicantMocks.applicantData(careers);
      const applicant = await ApplicantRepository.create(applicantData);

      await ApplicantRepository.update({
        uuid: applicant.uuid, sections: [{ title: "My title", text: "My text", displayOrder: 1 }]
      });
      const [section] = await applicant.getSections();
      expect(section).toMatchObject({
        title: "My title",
        text: "My text",
        displayOrder: 1
      });
      await ApplicantRepository.deleteSection(applicant.uuid, section.uuid);
      expect((await applicant.getSections()).length).toEqual(0);
    });

    it("should delete a link of an applicant", async () => {
      const careers = await careerMocks.createTenCareers();
      const codes = careers.map(c => c.code);
      const applicantData = applicantMocks.applicantData(careers);
      const applicant = await ApplicantRepository.create(applicantData);

      await ApplicantRepository.update({
        uuid: applicant.uuid, links: [{ name: "someName", url: "https://some.url" }]
      });
      const [link] = await applicant.getLinks();
      expect(link).toMatchObject({
        name: "someName",
        url: "https://some.url"
      });
      await ApplicantRepository.deleteLink(applicant.uuid, link.uuid);
      expect((await applicant.getLinks()).length).toEqual(0);
    });

    it("should not delete when deleting a not existing applicant capability", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData(
        [career],
        ["capability_1"]);
      const applicant = await ApplicantRepository.create(applicantData);
      const numberOfCapabilitiesBefore = (await applicant.getCapabilities()).length;
      await ApplicantRepository.deleteCapabilities(
        applicant,
        ["not existing description"]
      );
      expect((await applicant.getCapabilities()).length).toEqual(numberOfCapabilitiesBefore);
    });

    it("should throw an error if no career applicant is found", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const applicant = await ApplicantRepository.create(applicantData);
      await ApplicantRepository.deleteCareers(applicant, [career.code]);
      await expect(
        CareerApplicantRepository.findByApplicantAndCareer(applicant.uuid, career.code)
      ).rejects.toThrow(CareerApplicantNotFound);
    });
  });

  describe("ApplyToOffers", () => {
    beforeEach(async () => {
      await Applicant.truncate({ cascade: true });
      await Company.truncate({ cascade: true });
      await Offer.truncate({ cascade: true });
    });

    it("should apply to a new jobApplication", async () => {
      const { id: companyId } = await Company.create(companyMockData);
      const offer = await Offer.create(OfferMocks.completeData(companyId));
      const applicant = await Applicant.create(applicantMocks.applicantData([]));
      const jobApplication = await ApplicantRepository.applyToOffer(applicant, offer);
      expect(jobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
        );
    });
  });
});
