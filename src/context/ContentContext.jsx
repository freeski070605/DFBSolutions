import { createContext, useContext, useEffect, useState } from "react";
import { servicePages as fallbackServices } from "../data/servicePages.js";

const fallbackSiteContent = {
  home: { eyebrow: "PHOTO · VIDEO · DIGITAL", headline: "Photography. Film. Digital Solutions.", intro: "DFB captures meaningful moments, creates visual stories, develops brands, and builds websites, apps, and digital systems.", primaryCtaLabel: "Book Photo / Video", primaryCtaLink: "/contact?service=photography", secondaryCtaLabel: "Start a Digital Project", secondaryCtaLink: "/contact?service=website", additionalHeading: "More from DFB", additionalCopy: "Transportation and practical property solutions remain available when you need them." },
  about: { headline: "Creative instinct. Digital thinking. One standard.", intro: "DFB connects visual storytelling and useful digital products through clear planning, professional execution, and care for the finish.", story: "DFB was created to help people move meaningful ideas forward without losing clarity between creative vision and practical execution.", mission: "Capture what matters. Build what helps. Deliver work that is ready for the real world." },
  global: { processIntro: "A clear process from first conversation to finished work.", serviceArea: "Service area details available with your quote.", trustCopy: "Custom planning, professional editing, private gallery delivery where appropriate, and clear agreements for every confirmed project." },
};

const ContentContext = createContext({ services: fallbackServices, siteContent: fallbackSiteContent, testimonials: [], loading: false });

export function ContentProvider({ children }) {
  const [state, setState] = useState({ services: fallbackServices, siteContent: fallbackSiteContent, testimonials: [], loading: true });
  useEffect(() => {
    let active = true;
    Promise.all(["services", "site-content", "testimonials"].map((name) => fetch(`/api/content/${name}`).then((response) => response.ok ? response.json() : null).catch(() => null)))
      .then(([services, content, testimonials]) => {
        if (!active) return;
        setState({
          services: services?.items?.length ? services.items : fallbackServices,
          siteContent: {
            home: { ...fallbackSiteContent.home, ...(content?.item?.home || {}) },
            about: { ...fallbackSiteContent.about, ...(content?.item?.about || {}) },
            global: { ...fallbackSiteContent.global, ...(content?.item?.global || {}) },
          },
          testimonials: testimonials?.items || [], loading: false,
        });
      });
    return () => { active = false; };
  }, []);
  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
