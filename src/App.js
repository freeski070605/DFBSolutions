import AnimatedGridBackground from './components/AnimatedGridBackground.js';
import FeaturedBuilds from './components/FeaturedBuilds.js';
import Footer from './components/Footer.js';
import HeroControlRoom from './components/HeroControlRoom.js';
import LabSection from './components/LabSection.js';
import LaneSelector from './components/LaneSelector.js';
import MediaSection from './components/MediaSection.js';
import Navbar, { initNavbar } from './components/Navbar.js';
import ReceiptsSection from './components/ReceiptsSection.js';
import ServicesCommandCenter from './components/ServicesCommandCenter.js';
import SoundSection from './components/SoundSection.js';
import StartProjectCTA, { initStartProjectForm } from './components/StartProjectCTA.js';

export default function App() {
  return `${Navbar()}<main>${AnimatedGridBackground()}${HeroControlRoom()}${LaneSelector()}${ServicesCommandCenter()}${FeaturedBuilds()}${LabSection()}${MediaSection()}${SoundSection()}${ReceiptsSection()}${StartProjectCTA()}</main>${Footer()}`;
}

export function initApp() {
  document.documentElement.classList.add('motion-ready');
  initNavbar();
  initStartProjectForm();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }
}
