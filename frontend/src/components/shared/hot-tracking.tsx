import { MATOMO_APP_DOMAIN, MATOMO_ID, MATOMO_TRACKING_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-storage";
import { useEffect, useState } from "react";
import { Link } from "@/components/ui/link";
import { ButtonVariant, SHOELACE_SIZES } from "@/enums";
import { HOT_PRIVACY_POLICY_URL } from "@/constants";

declare global {
  interface Window {
    _paq: any[];
  }
}

/**
 * Adapted from - https://github.com/hotosm/ui/blob/main/src/components/tracking/tracking.component.ts
 * Last accessed - 2025/26/02
 * @returns
 */

export const HotTracking = ({ showTracking }: { showTracking: boolean }) => {
  const { setValue, getValue } = useLocalStorage();
  const storageKey = `${MATOMO_ID}-consent-agree`;
  const [showConsent, setShowConsent] = useState<boolean>(
    getValue(storageKey) === undefined,
  );


  const [isVisible, setIsVisible] = useState<boolean>(showConsent);


  useEffect(() => {
    if (!showConsent) {
      // Wait for animation duration (650ms) before removing from DOM
      const timer = setTimeout(() => setIsVisible(false), 650);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [showConsent]);



  const injectMatomoScript = (method?: string) => {
    //  Close and halt execution if wrong domain
    if (window.location.hostname !== MATOMO_APP_DOMAIN) {
      console.warn(
        `Matomo init failed. ${window.location.hostname} does not match ${MATOMO_APP_DOMAIN}.`,
      );

      return;
    }
    // Close and halt execution if siteId or domain not set
    if (MATOMO_ID.length === 0 || MATOMO_APP_DOMAIN.length === 0) {
      console.warn("Matomo init failed. No site id or domains provided.");

      return;
    }

    const _paq = (window._paq = window._paq || []);

    // tracker methods like "setCustomDimension" should be called before "trackPageView"
    _paq.push(["requireConsent"]);
    _paq.push(["setDomains", [MATOMO_APP_DOMAIN]]);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]); // Tracks downloads
    _paq.push(["trackVisibleContentImpressions"]); // Tracks content

    // Any passed method.
    if (method) {
      _paq.push([method]);
    }

    (function (matomoURL) {
      _paq.push(["setTrackerUrl", `${matomoURL}/matomo.php`]);
      _paq.push(["setSiteId", MATOMO_ID]);

      const d = document;
      const g = d.createElement("script");
      const s = d.getElementsByTagName("script")[0];

      if (s?.parentNode != null) {
        g.async = true;
        g.src = `${matomoURL}/matomo.js`;
        s.parentNode.insertBefore(g, s);
      } else {
        console.warn("Script insertion failed. Parent node is null.");
      }
    })(MATOMO_TRACKING_URL);
  };

  const handleAgree = () => {
    injectMatomoScript();
    setValue(storageKey, "true");
    setShowConsent(false);
  };

  const handleDisagree = () => {
    injectMatomoScript("forgetConsentGiven");
    setValue(storageKey, "false");
    setShowConsent(false);
  };


  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform transition-all duration-[650ms] -translate-x-1/2 ${showTracking ? "translate-y-0" : "translate-y-full"
        } ${showConsent ? "opacity-100 visible" : "opacity-0 invisible"
        } mx-auto w-full lg:w-[70%] z-[100000000000] px-3`}
    >
      <div className="bg-[#2C3038] rounded-t-2xl p-4 text-white flex flex-col sm:flex-row gap-10 items-center">
        <div className="flex gap-y-4 flex-col">
          <h1 className="font-semibold text-body-1">
            About the information we collect
          </h1>
          <p className="font-normal text-body-3">
            We use cookies and similar technologies to recognize and analyze
            your visits, and measure traffic usage and activity. You can learn
            about how we use the data about your visit or information you
            provide reading our{" "}
            <span>
              <Link
                href={HOT_PRIVACY_POLICY_URL}
                title="privacy policy"
                className="text-primary lowercase underline"
                nativeAnchor
                blank
              >
                privacy policy
              </Link>
            </span>
            . By clicking "I Agree", you consent to the use of cookies.
          </p>
        </div>
        <div className="flex flex-col items-center gap-6 w-full md:w-fit">
          <Button
            onClick={handleAgree}
            uppercase={false}
            size={SHOELACE_SIZES.MEDIUM}
          >
            I Agree
          </Button>
          <Button
            onClick={handleDisagree}
            uppercase={false}
            size={SHOELACE_SIZES.MEDIUM}
            variant={ButtonVariant.DEFAULT}
          >
            I Do Not Agree
          </Button>
        </div>
      </div>
    </div>
  );
};
