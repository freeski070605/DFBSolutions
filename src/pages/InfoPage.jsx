import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const content = {
  privacy: {
    title: "Privacy",
    intro: "DFB Solutions collects only the information you choose to provide through an inquiry.",
    sections: [
      ["Information we collect", "The contact form may collect your name, email, phone number, project details, timing, budget context, and route or city-level information relevant to your request."],
      ["How it is used", "Submitted information is used to review your request, respond, and determine appropriate next steps. It is not presented publicly through this website."],
      ["Sensitive property and trip information", "The initial form does not request a private street address. More precise information should only be shared when it is needed for an active project conversation."],
      ["Contact", "Questions about information submitted through this site can be sent through the contact form."],
    ],
  },
  terms: {
    title: "Terms",
    intro: "Website content is provided for general information about DFB Solutions and its solution divisions.",
    sections: [
      ["Project inquiries", "Submitting an inquiry does not create a service agreement or guarantee availability. Scope, timing, pricing, and project terms are confirmed separately."],
      ["Capabilities", "Services are reviewed for fit and lawful scope. Property Solutions does not advertise licensed electrical, plumbing, roofing, structural engineering, or other licensed trade work."],
      ["Portfolio", "Portfolio descriptions are concise summaries of completed experience. Private customer information and unsupported performance claims are intentionally excluded."],
      ["Updates", "These terms may be updated as the website and business operations evolve."],
    ],
  },
};

export default function InfoPage({ kind }) {
  const page = content[kind];
  return <main id="top"><Seo title={page.title} /><section className="page-hero compact-hero section"><div><p className="eyebrow">Information</p><h1>{page.title}</h1><p>{page.intro}</p></div></section><section className="section legal-copy">{page.sections.map(([title, copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}<Link className="btn btn-secondary" to="/contact">Contact DFB Solutions</Link></section></main>;
}
