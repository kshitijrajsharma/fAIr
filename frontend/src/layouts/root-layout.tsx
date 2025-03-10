import { APPLICATION_ROUTES, MODELS_ROUTES } from "@/constants";
import { Banner } from "@/components/ui/banner";
import { Footer } from "@/components/layout";
import { HotTracking } from "@/components/shared";
import { NavBar } from "@/components/layout";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useScrollToTop } from "@/hooks/use-scroll-to-element";
import { useAuth } from "@/app/providers/auth-provider";
import { AuthenticationModal } from "@/components/auth";

export const RootLayout = () => {
  const { pathname, state } = useLocation();
  const { scrollToTop } = useScrollToTop();

  /**
   * Scroll to top on pages switch.
   */
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  const { isAuthenticated } = useAuth();
  const [showTracking, setShowTracking] = useState<boolean>(false);
  /**
   * Get the model id from the URL. If it exists,
   * we can safely assume the user is in edit mode.
   * Therefore, we can disable the footer.
   */
  const { modelId } = useParams();

  useEffect(() => {
    /**
     * Show the tracking 5 seconds after the page renders.
     */
    const timer = setTimeout(() => {
      setShowTracking(true);
    }, 5000);

    return () => clearTimeout(timer);
  });

  return (
    <>
      {showTracking && <HotTracking />}
      {/* Show the auth modal when a `backgroundLocation` is set and when the user is not authenticated. */}
      <AuthenticationModal
        isOpen={state?.backgroundLocation && !isAuthenticated}
      />
      <main className="min-h-screen relative mx-auto flex flex-col justify-between">
        {!pathname.includes(APPLICATION_ROUTES.AUTH_CALLBACK) &&
          !pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) && (
            <>
              <Banner />
              <NavBar />
            </>
          )}

        <div
          // Disable global padding on landing page.
          className={`${pathname === APPLICATION_ROUTES.HOMEPAGE ? "" : "app-padding"} w-full`}
        >
          <Outlet />
        </div>
        {!pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) &&
          !pathname.includes(MODELS_ROUTES.CREATE_MODEL_BASE) &&
          !modelId &&
          !pathname.includes(APPLICATION_ROUTES.AUTH_CALLBACK) && <Footer />}
      </main>
    </>
  );
};
