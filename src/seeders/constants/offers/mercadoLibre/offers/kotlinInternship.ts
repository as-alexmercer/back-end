import { uuids } from "../../../uuids";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";
import { sections } from "../../sections";
import { description } from "../description";

export const kotlinInternship = {
  offer: {
    uuid: uuids.offers.kotlinInternship,
    companyUuid: uuids.companies.mercadoLibre.uuid,
    title: "Pasantía: desarrollador Kotlin",
    targetApplicantType: ApplicantType.student,
    description,
    isInternship: true,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.pending,
    graduadosApprovalStatus: ApprovalStatus.pending,
    minimumSalary: 44000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.kotlinInternship)
};
