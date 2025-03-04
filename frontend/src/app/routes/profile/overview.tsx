import { Head } from "@/components/seo";
import { ProfileStatistics } from "@/features/user-profile/components";

export const UserProfileOverviewPage = () => {
  return (
    <>
      <Head title="My Profile" />
      <ProfileStatistics />
    </>
  );
};
