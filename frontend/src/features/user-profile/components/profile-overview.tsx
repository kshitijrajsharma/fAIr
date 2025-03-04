import { ChevronDownIcon } from "@/components/ui/icons";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { APPLICATION_ROUTES } from "@/constants";
import { TUser } from "@/types";

export const ProfileOverview = ({ user }: { user: TUser }) => {
  return (
    <section className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-x-6">
        <div className="p-2 w-40 h-40 border-4 border-primary rounded-full">
          <Image
            src={user.img_url}
            className="w-full h-full rounded-full border-gray-border"
            alt={user.username}
          />
        </div>
        <div>
          <h1 className="text-title-2 font-bold">{user.username}</h1>
          <small className="text-gray text-body-3">
            Joined {new Date().toLocaleDateString()}
          </small>
        </div>
      </div>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-2">
          <h3 className="font-bold text-body-3">90% Complete</h3>
          <div className="bg-light-gray h-1.5 w-full rounded-xl">
            <div
              style={{ width: "90%" }}
              className="bg-primary h-1.5 rounded-xl"
            ></div>
          </div>
        </div>
        <Link
          nativeAnchor={false}
          disableLinkStyle
          title="Complete your profile"
          href={APPLICATION_ROUTES.PROFILE_SETTINGS}
          className="!text-primary font-semibold text-body-3 inline-flex items-center gap-x-2"
        >
          Complete your profile{" "}
          <span>
            <ChevronDownIcon className="w-3 h-3 -rotate-90" />
          </span>
        </Link>
      </div>
    </section>
  );
};
