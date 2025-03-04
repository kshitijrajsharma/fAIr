import {
  BotIcon,
  DatabaseIcon,
  FeedbackIcon,
  ProductionCheckmarkIcon,
} from "@/components/ui/icons";
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
    label: "Models Created",
  },
  {
    stat: 5,
    icon: ProductionCheckmarkIcon,
    label: "Accepted Features",
  },
  {
    stat: 1235,
    icon: DatabaseIcon,
    label: "Datasets",
  },
  {
    stat: 533,
    icon: FeedbackIcon,
    label: "Feedbacks",
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
