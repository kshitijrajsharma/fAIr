import { Link } from "@/components/ui/link";
import { PROFILE_NAVIGATION_TABS } from "@/constants";
import { useLocation } from "react-router-dom";

export const ProfileNavigationTabs = () => {
  const { pathname } = useLocation();

  return (
    <section className="border-b border-gray-border px-8">
      <ul className="flex gap-x-20 transition-all duration-300 overflow-x-auto px-4">
        {PROFILE_NAVIGATION_TABS.filter((route) => route.active).map(
          (route) => (
            <li key={route.title}>
              <Link
                href={route.href}
                title={route.title}
                nativeAnchor={false}
                disableLinkStyle
                className={`text-gray text-body-3 transition-all duration-300 flex flex-col whitespace-nowrap`}
              >
                {route.title}
                <span
                  className={`transition-all duration-100 w-[120%] self-center rounded-t-3xl h-1 ${pathname === route.href ? "visible bg-red-500" : "invisible"}`}
                ></span>
              </Link>
            </li>
          ),
        )}
      </ul>
    </section>
  );
};
