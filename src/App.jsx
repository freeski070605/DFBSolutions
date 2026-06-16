import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AnimatedGridBackground from "./components/AnimatedGridBackground.jsx";
import Navbar from "./components/Navbar.jsx";
import HeroCreativeWall from "./components/HeroCreativeWall.jsx";
import LaneSelector from "./components/LaneSelector.jsx";
import ServicesCommandCenter from "./components/ServicesCommandCenter.jsx";
import FeaturedBuilds from "./components/FeaturedBuilds.jsx";
import LabSection from "./components/LabSection.jsx";
import MediaSection from "./components/MediaSection.jsx";
import SoundSection from "./components/SoundSection.jsx";
import ReceiptsSection from "./components/ReceiptsSection.jsx";
import StartProjectCTA from "./components/StartProjectCTA.jsx";
import Footer from "./components/Footer.jsx";
import SoundPage from "./pages/SoundPage.jsx";
import { scrollToHash } from "./utils/navigation.js";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.setTimeout(() => scrollToHash(location.hash), 80);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-slate-100">
      <AnimatedGridBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sound" element={<SoundPage />} />
      </Routes>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <main>
        <HeroCreativeWall />
        <LaneSelector />
        <ServicesCommandCenter />
        <FeaturedBuilds />
        <LabSection />
        <MediaSection />
        <SoundSection />
        <ReceiptsSection />
        <StartProjectCTA />
      </main>
      <Footer />
    </>
  );
}
