import { ApprovalStatus } from "../../../models/ApprovalStatus/index";
import { uuids } from "../uuids";
import { careerCodes } from "../careerCodes";
import generateUuid from "uuid/v4";

export const sebastian = {
  user: {
    uuid: uuids.sebastian.user,
    email: "seblanco@fi.uba.ar",
    name: "Sebastián Ezequiel",
    surname: "Blanco",
    dni: "333",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  applicant: {
    uuid: uuids.sebastian.applicant,
    userUuid: uuids.sebastian.user,
    padron: 98539,
    approvalStatus: ApprovalStatus.approved,
    description:
      "Me considero una persona a la que le gusta tomar " +
      "riesgos y también tener cierto control sobre la situación." +
      "Por eso tengo como objetivos ser un desarrollador de software y" +
      "también formar parte de la gestión de proyectos, ya " +
      "que me interesa el balance de esos aspectos.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  sections: [
    {
      uuid: generateUuid(),
      applicantUuid: uuids.sebastian.applicant,
      title: "Experiencia Laboral",
      text:
        "Trabajo junto al equipo de Keepcon como desarrollador full stack." +
        "Por ejemplo, estoy trabajando en la integración de LinkedIn a" +
        " la herramienta.\nTrabajo en Rails con un frontend en Backbone.js," +
        "y en un motor de procesamiento de datos de redes sociales en" +
        "Apache Storm (Java). Respecto del uso base de datos, trabajo " +
        "con PostgreSQL y Cassandra indexada con Elasticsearch.",
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  capabilities: [
    {
      capabilityUuid: uuids.capabilities.java,
      applicantUuid: uuids.sebastian.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  careers: [
    {
      careerCode: careerCodes.IngenieriaInformatica,
      applicantUuid: uuids.sebastian.applicant,
      isGraduate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      careerCode: careerCodes.IngenieriaAlimentos,
      applicantUuid: uuids.sebastian.applicant,
      currentCareerYear: 1,
      approvedSubjectCount: 4,
      isGraduate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  jobApplications: [
    {
      uuid: generateUuid(),
      offerUuid: uuids.offers.javaSemiSenior,
      applicantUuid: uuids.sebastian.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: generateUuid(),
      offerUuid: uuids.offers.javaJunior,
      applicantUuid: uuids.sebastian.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: generateUuid(),
      offerUuid: uuids.offers.javaSenior,
      applicantUuid: uuids.sebastian.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: generateUuid(),
      offerUuid: uuids.offers.rubyJunior,
      applicantUuid: uuids.sebastian.applicant,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
