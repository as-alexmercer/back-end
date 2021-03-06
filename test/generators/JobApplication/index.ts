import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";
import { Secretary } from "$models/Admin";
import { AdminGenerator } from "$generators/Admin";
import { OfferRepository } from "$models/Offer";

const getApplicantForSecretary = (secretary: Secretary) => {
  const generator = ApplicantGenerator.instance;
  if (secretary === Secretary.graduados) {
    return generator.graduate({ status: ApprovalStatus.approved });
  }
  return generator.student({ status: ApprovalStatus.approved });
};

export const JobApplicationGenerator = {
  instance: {
    withMinimumData: async () => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const jobApplication = applicant.applyTo(offer);
      await JobApplicationRepository.save(jobApplication);
      return jobApplication;
    },
    updatedWithStatus: async ({ status }: IUpdatedWithStatus) => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      jobApplication.set({ approvalStatus: status });
      return JobApplicationRepository.save(jobApplication);
    },
    toTheCompany: async (companyUuid: string) => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const jobApplication = applicant.applyTo(offer);
      await JobApplicationRepository.save(jobApplication);
      return jobApplication;
    },
    toBeModeratedBy: async (secretary: Secretary) => {
      const graduadosAdmin = await AdminGenerator.graduados();
      const extensionAdmin = await AdminGenerator.extension();
      const company = await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.approved);
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      await OfferRepository.save(offer);
      const applicant = await getApplicantForSecretary(secretary);
      const jobApplication = applicant.applyTo(offer);
      await JobApplicationRepository.save(jobApplication);
      return jobApplication;
    }
  }
};

interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}
