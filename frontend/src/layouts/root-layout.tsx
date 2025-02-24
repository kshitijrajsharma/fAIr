import { APPLICATION_ROUTES } from "@/constants";
import { Banner } from "@/components/ui/banner";
import { Footer } from "@/components/layout";
import { HotTracking } from "@/components/shared";
import { NavBar } from "@/components/layout";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useScrollToTop } from "@/hooks/use-scroll-to-element";
import { OpenStreetMapAuthModal } from "@/components/auth";

export const RootLayout = () => {
  const { pathname, state } = useLocation();
  const { scrollToTop } = useScrollToTop();
  // Scroll to top on pages switch.
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  const pagesWithoutNavbarAndFooter = [
    APPLICATION_ROUTES.OSM_LOGIN,
    APPLICATION_ROUTES.START_MAPPING_BASE
  ];

  const pagesWithoutPadding = [
    APPLICATION_ROUTES.HOMEPAGE
  ]
  return (
    <>
      <HotTracking />
      {
        state?.backgroundLocation && <OpenStreetMapAuthModal />
      }
      <main className="min-h-screen relative  mx-auto flex flex-col justify-between">
        <Banner />
        {!pagesWithoutNavbarAndFooter.includes(pathname) && (
          <NavBar />
        )}

        <div
          // Disable global padding on landing page.
          className={`${pagesWithoutPadding.includes(pathname) ? "" : "app-padding"} w-full`}
        >
          <Outlet />
        </div>
        {!pagesWithoutNavbarAndFooter.includes(pathname) && (
          <Footer />
        )}
      </main>
    </>
  );
};
