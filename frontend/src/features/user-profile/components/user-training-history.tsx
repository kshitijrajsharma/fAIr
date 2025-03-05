import { USER_PROFILE_PAGE_CONTENT } from "@/constants/ui-contents/user-profile-content";
import { ProfileSectionHeader } from "./profile-section-header";

export const UserTrainingHistory = () => {
  return (
    <section>
      <ProfileSectionHeader
        title={USER_PROFILE_PAGE_CONTENT.overview.trainingsSectionTitle}
      />
      <div className="w-full h-80 bg-frosted-blue mt-10 rounded-xl"></div>
    </section>
  );
};
