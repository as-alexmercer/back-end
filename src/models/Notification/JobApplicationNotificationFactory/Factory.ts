import { Admin, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { MissingModeratorMessageError } from "..";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import {
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  PendingJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { Notification } from "$models/Notification";
import { OfferRepository } from "$models/Offer";

export const JobApplicationNotificationFactory = {
  create: async (
    jobApplication: JobApplication,
    admin: Admin,
    moderatorMessage?: string
  ): Promise<Notification[]> => {
    if (jobApplication.approvalStatus === ApprovalStatus.approved) {
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      return [
        new NewJobApplicationCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: companyUuid,
          jobApplicationUuid: jobApplication.uuid
        }),
        new ApprovedJobApplicationApplicantNotification({
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: jobApplication.applicantUuid,
          jobApplicationUuid: jobApplication.uuid
        })
      ];
    } else if (jobApplication.approvalStatus === ApprovalStatus.rejected) {
      if (!moderatorMessage) throw new MissingModeratorMessageError();
      return [
        new RejectedJobApplicationApplicantNotification({
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: jobApplication.applicantUuid,
          jobApplicationUuid: jobApplication.uuid,
          moderatorMessage
        })
      ];
    }
    return [
      new PendingJobApplicationApplicantNotification({
        moderatorUuid: admin.userUuid,
        notifiedApplicantUuid: jobApplication.applicantUuid,
        jobApplicationUuid: jobApplication.uuid
      })
    ];
  }
};
