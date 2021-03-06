import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";

export const rubySenior = {
  offer: {
    uuid: uuids.offers.rubySenior,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Ruby senior",
    targetApplicantType: ApplicantType.both,
    description,
    isInternship: false,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.pending,
    graduadosApprovalStatus: ApprovalStatus.pending,
    minimumSalary: 52500,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.rubySenior)
};
