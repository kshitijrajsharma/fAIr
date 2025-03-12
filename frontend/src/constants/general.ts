import { APPLICATION_ROUTES } from "./routes";
import { SHARED_CONTENT } from "@/constants";
import { TNavBarLinks, TFooterLinks } from "@/types";

export const navLinks: TNavBarLinks = [
  {
    title: SHARED_CONTENT.navbar.routes.exploreModels,
    href: APPLICATION_ROUTES.MODELS,
    active: true,
  },
  {
    title: SHARED_CONTENT.navbar.routes.learn,
    href: APPLICATION_ROUTES.LEARN,
    active: false,
  },
  {
    title: SHARED_CONTENT.navbar.routes.about,
    href: APPLICATION_ROUTES.ABOUT,
    active: true,
  },
  {
    title: SHARED_CONTENT.navbar.routes.resources,
    href: APPLICATION_ROUTES.RESOURCES,
    active: false,
  },
];

type TFooterGroupLinks = {
  groupOne: TFooterLinks;
  groupTwo: TFooterLinks;
};

export const footerLinks: TFooterGroupLinks = {
  groupOne: [
    {
      title: "explore models",
      route: APPLICATION_ROUTES.MODELS,
      active: true,
    },
    {
      title: "learn",
      route: APPLICATION_ROUTES.LEARN,
      active: false,
    },
    {
      title: "about",
      route: APPLICATION_ROUTES.ABOUT,
      active: true,
    },
  ],
  groupTwo: [
    {
      title: "resources",
      route: APPLICATION_ROUTES.RESOURCES,
      isExternalLink: false,
      active: false,
    },
    {
      title: "privacy policy",
      route: "https://www.hotosm.org/privacy",
      isExternalLink: true,
      active: true,
    },
  ],
};
