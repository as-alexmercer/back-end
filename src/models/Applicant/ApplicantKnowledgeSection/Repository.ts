import { Applicant, ApplicantKnowledgeSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export class ApplicantKnowledgeSectionRepository extends SectionRepository {
  public async update({
    applicant,
    ...updateArguments
  }: IUpdateProps & { applicant: Applicant }): Promise<ApplicantKnowledgeSection[]> {
    return super.updateSection({ model: applicant, ...updateArguments });
  }

  protected modelClass() {
    return ApplicantKnowledgeSection;
  }

  protected entityUuidKey() {
    return "applicantUuid";
  }
}
