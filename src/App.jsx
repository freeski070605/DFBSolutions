import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DivisionPage from "./pages/DivisionPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import SoundPage from "./pages/SoundPage.jsx";
import WorkPage from "./pages/WorkPage.jsx";

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
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
