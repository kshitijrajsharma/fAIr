import styles from "@/components/layout/navbar/navbar.module.css";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { DrawerPlacements } from "@/enums";
import { HamburgerIcon } from "@/assets/svgs";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { navLinks } from "@/constants/general";
import { NavLogo, NotificationBell } from "@/components/layout";
import { SHARED_CONTENT } from "@/constants";
import { useAuth } from "@/app/providers/auth-provider";
import { useLocation, useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/layout";
import { useEffect, useState } from "react";
import { NotificationPanel } from "@/features/user-profile/components";
import { useNotifications } from "@/features/user-profile/hooks/use-notifications";
import { TNotification } from "@/types";
import useScreenSize from "@/hooks/use-screen-size";

export const NavBar = () => {
  const [open, setOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  const [unRead, setUnread] = useState<boolean | undefined>(undefined);

  const navigate = useNavigate();

  const location = useLocation();

  const [showNotificationPanel, setShowNotificationPanel] =
    useState<boolean>(false);

  const { data, isPending, isError } = useNotifications({
    enabled: isAuthenticated,
    is_read: unRead,
  });

  const { screenWidth } = useScreenSize();

  const notificationAnchor = "notificationPanel";

  /**
   * Close the notification panel incase the user resizes their browser.
   * 960px is the point where the hamburger shows.
   */
  useEffect(() => {
    if (screenWidth > 960) return;
    setShowNotificationPanel(false);
  }, [screenWidth]);

  return (
    <>
      <Drawer open={open} setOpen={setOpen} placement={DrawerPlacements.END}>
        <div className={styles.drawerContentContainer}>
          <div className={styles.drawerHeaderContainer}>
            <NavLogo />
            <button
              onClick={() => setOpen(false)}
              className={styles.closeButton}
            >
              &#x2715;
            </button>
          </div>
          <div className={styles.navLinksContainer}>
            <NavBarLinks className={styles.mobileNavLinks} setOpen={setOpen} />
          </div>
          <div className={styles.loginButtonContainer}>
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  /*
                   * Set the `backgroundLocation` in location state so that when we open the authentication modal we still see the current page in the background.
                   */
                  navigate(location, {
                    state: { backgroundLocation: location },
                  });
                }}
              >
                {SHARED_CONTENT.navbar.loginButton}
              </Button>
            )}
          </div>
        </div>
      </Drawer>

      <nav className={`${styles.nav} app-padding z-20`}>
        {showNotificationPanel && (
          <NotificationPanel
            active={showNotificationPanel}
            setShowNotificationPanel={setShowNotificationPanel}
            anchor={notificationAnchor}
            isPending={isPending}
            isError={isError}
            notifications={data?.results as TNotification[]}
            setUnread={setUnread}
            unRead={unRead}
            isSmallViewport={screenWidth < 960}
          />
        )}
        <NavLogo />
        <div>
          <NavBarLinks className={styles.webNavLinks} />
        </div>
        <div>
          {isAuthenticated ? (
            <div className={`${styles.profileContainer} `}>
              <NotificationBell
                setShowNotificationPanel={setShowNotificationPanel}
                showNotificationPanel={showNotificationPanel}
                notificationAnchor={notificationAnchor}
              />
              <UserProfile />
            </div>
          ) : (
            <Button
              variant="primary"
              className={styles.loginButton}
              onClick={() => {
                /*
                 * Set the `backgroundLocation` in location state so that when we open the authentication modal we still see the current page in the background.
                 */
                navigate(location, {
                  state: { backgroundLocation: location },
                });
              }}
            >
              {SHARED_CONTENT.navbar.loginButton}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-x-2 mdx:hidden">
          {
            isAuthenticated &&
            <NotificationBell
              setShowNotificationPanel={setShowNotificationPanel}
              showNotificationPanel={showNotificationPanel}
              notificationAnchor={notificationAnchor}
            />
          }
          <button
            className={styles.hamburgerMenu}
            onClick={() => setOpen(true)}
          >
            <Image
              src={HamburgerIcon}
              alt={SHARED_CONTENT.navbar.hamburgerMenuAlt}
              title={SHARED_CONTENT.navbar.hamburgerMenuTitle}
              width="20px"
              height="20px"
            />
          </button>
        </div>
      </nav>
    </>
  );
};

type NavBarLinksProps = {
  className: string;
  setOpen?: (arg: boolean) => void;
};

const NavBarLinks: React.FC<NavBarLinksProps> = ({ className, setOpen }) => {
  const location = useLocation();

  return (
    <ul className={className}>
      {navLinks.map((link, id) => (
        <li
          key={`navbar-item-${id}`}
          onClick={() => {
            //close the drawer after navigating to a new page on mobile
            setOpen && setOpen(false);
          }}
          className={`${styles.navLinkItem} ${location.pathname.includes(link.href) && styles.activeLink}`}
        >
          <Link href={link.href} title={link.title} nativeAnchor={false}>
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};
