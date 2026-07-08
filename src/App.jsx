import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AnimatedGridBackground from "./components/AnimatedGridBackground.jsx";
import Navbar from "./components/Navbar.jsx";
import HomeV2 from "./components/HomeV2.jsx";
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
      <HomeV2 />
      <Footer />
    </>
  );
}
