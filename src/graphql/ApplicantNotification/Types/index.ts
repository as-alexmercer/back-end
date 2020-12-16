import { GraphQLApplicantNotification } from "./GraphQLApplicantNotification";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { GraphQLApprovedProfileApplicantNotification } from "./GraphQLApprovedProfileApplicantNotification";
import { GraphQLRejectedProfileApplicantNotification } from "./GraphQLRejectedProfileApplicantNotification";

export const applicantNotificationTypes = [
  GraphQLApplicantNotification,
  GraphQLApprovedJobApplicationApplicantNotification,
  GraphQLRejectedJobApplicationApplicantNotification,
  GraphQLApprovedProfileApplicantNotification,
  GraphQLRejectedProfileApplicantNotification
];