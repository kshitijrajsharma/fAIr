import {
  BotIcon,
  DatabaseIcon,
  FeedbackIcon,
  ProductionCheckmarkIcon,
} from "@/components/ui/icons";
import { USER_PROFILE_PAGE_CONTENT } from "@/constants/ui-contents/user-profile-content";
import { IconProps } from "@/types";
import { FC } from "react";

type TProfileStatsItems = {
  stat: number;
  label: string;
  icon: FC<IconProps>;
}[];

const profileStatsItems: TProfileStatsItems = [
  {
    stat: 5,
    icon: BotIcon,
    label: USER_PROFILE_PAGE_CONTENT.overview.statistics.modelsCreated,
  },
  {
    stat: 5,
    icon: ProductionCheckmarkIcon,
    label: USER_PROFILE_PAGE_CONTENT.overview.statistics.acceptedFeaturesTitle,
  },
  {
    stat: 1235,
    icon: DatabaseIcon,
    label: USER_PROFILE_PAGE_CONTENT.overview.statistics.datasets,
  },
  {
    stat: 533,
    icon: FeedbackIcon,
    label: USER_PROFILE_PAGE_CONTENT.overview.statistics.feedbacks,
  },
];

export const ProfileStatistics = () => {
  return (
    <section className="w-full h-40 bg-frosted-blue rounded-xl">
      <div className="flex items-center h-full w-full justify-around">
        {profileStatsItems.map((stat) => (
          <div className="flex gap-x-3 items-center">
            <div className="bg-primary rounded-full">
              <stat.icon className="h-12 w-12 p-2 text-white" />
            </div>
            <div>
              <h1 className="text-title-2 font-bold text-primary">
                {stat.stat < 10 && "0"}
                {stat.stat}
              </h1>
              <p className="text-body-3">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
