import AnimatedGridBackground from './components/AnimatedGridBackground.jsx';
import FeaturedBuilds from './components/FeaturedBuilds.jsx';
import Footer from './components/Footer.jsx';
import HeroControlRoom from './components/HeroControlRoom.jsx';
import LabSection from './components/LabSection.jsx';
import LaneSelector from './components/LaneSelector.jsx';
import MediaSection from './components/MediaSection.jsx';
import Navbar, { initNavbar } from './components/Navbar.jsx';
import ReceiptsSection from './components/ReceiptsSection.jsx';
import ServicesCommandCenter from './components/ServicesCommandCenter.jsx';
import SoundSection from './components/SoundSection.jsx';
import StartProjectCTA, { initStartProjectForm } from './components/StartProjectCTA.jsx';

export default function App() {
  return `${Navbar()}<main>${AnimatedGridBackground()}${HeroControlRoom()}${LaneSelector()}${ServicesCommandCenter()}${FeaturedBuilds()}${LabSection()}${MediaSection()}${SoundSection()}${ReceiptsSection()}${StartProjectCTA()}</main>${Footer()}`;
}

export function initApp() {
  initNavbar();
  initStartProjectForm();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}
