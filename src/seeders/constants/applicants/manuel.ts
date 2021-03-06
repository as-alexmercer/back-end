import { uuids } from "../uuids";
import { careerCodes } from "../careerCodes";
import { ApprovalStatus } from "../../../models/ApprovalStatus/index";

export const manuel = {
  user: {
    uuid: uuids.manuel.user,
    email: "llauromanuel@gmail.com",
    name: "Manuel Luis",
    surname: "Llauró",
    dni: "222",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  applicant: {
    uuid: uuids.manuel.applicant,
    userUuid: uuids.manuel.user,
    approvalStatus: ApprovalStatus.approved,
    padron: 95736,
    description: "Dev",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  sections: [
    {
      uuid: uuids.manuel.sections.field1,
      applicantUuid: uuids.manuel.applicant,
      title: "Campo 1",
      text: "Contenido 1",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: uuids.manuel.sections.field2,
      applicantUuid: uuids.manuel.applicant,
      title: "Campo 2",
      text: "Contenido 2",
      displayOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: uuids.manuel.sections.field3,
      applicantUuid: uuids.manuel.applicant,
      title: "Campo 3",
      text: "Contenido 3",
      displayOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  capabilities: [
    {
      capabilityUuid: uuids.capabilities.python,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      capabilityUuid: uuids.capabilities.sql,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      capabilityUuid: uuids.capabilities.c,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  careers: [
    {
      careerCode: careerCodes.IngenieriaInformatica,
      applicantUuid: uuids.manuel.applicant,
      isGraduate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  jobApplications: [
    {
      uuid: uuids.manuel.jobApplications.javaSemiSenior,
      offerUuid: uuids.offers.javaSemiSenior,
      applicantUuid: uuids.manuel.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
