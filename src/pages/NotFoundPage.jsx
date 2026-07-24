import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFoundPage() {
  return <main id="top"><Seo title="Page Not Found" /><section className="not-found section"><span>404</span><p className="eyebrow">That path does not lead anywhere.</p><h1>Let’s get you back to a solution.</h1><div><Link className="btn btn-primary" to="/">Return home</Link><Link className="btn btn-secondary" to="/contact">Contact DFB</Link></div></section></main>;
}
