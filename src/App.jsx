import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DivisionPage from "./pages/DivisionPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import SoundPage from "./pages/SoundPage.jsx";
import WorkPage from "./pages/WorkPage.jsx";
import ServicePage from "./pages/ServicePage.jsx";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (location.hash) {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }, 40);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <div className="site-frame">
      {!isAdmin && <a className="skip-link" href="#main-content">Skip to content</a>}
      {!isAdmin && <Navbar />}
      <div id="main-content">
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/solutions/:slug" element={<DivisionPage />} />
          <Route path="/services/:slug" element={<ServicePage />} />
          <Route path="/photography" element={<ServicePage slug="photography" />} />
          <Route path="/videography" element={<ServicePage slug="videography" />} />
          <Route path="/weddings" element={<ServicePage slug="weddings" />} />
          <Route path="/events" element={<ServicePage slug="events" />} />
          <Route path="/sports-media" element={<ServicePage slug="sports-media" />} />
          <Route path="/music-videos" element={<ServicePage slug="music-videos" />} />
          <Route path="/brand-content" element={<ServicePage slug="brand-content" />} />
          <Route path="/websites" element={<ServicePage slug="websites" />} />
          <Route path="/apps" element={<ServicePage slug="apps" />} />
          <Route path="/branding" element={<ServicePage slug="branding" />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/privacy" element={<InfoPage kind="privacy" />} />
          <Route path="/terms" element={<InfoPage kind="terms" />} />
          <Route path="/sound" element={<SoundPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
    </div>
  );
}
