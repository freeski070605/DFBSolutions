import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDivisions } from "../context/DivisionsContext.jsx";

const options = [
  ["digital", "I need a website, app, or business system", "What needs to work better?", ["Launch a new idea", "Improve an existing platform", "Organize a workflow"]],
  ["creative", "I need photography or video", "What are we creating?", ["Event coverage", "Artist or athlete content", "Brand content"]],
  ["property", "I need help with a property project", "What kind of help do you need?", ["Repair", "Small build or improvement", "Assembly or installation"]],
  ["transportation", "I need transportation for a group or event", "What are you planning?", ["Event transportation", "Point-to-point trip", "Multi-stop itinerary"]],
  ["unsure", "I am not sure what solution I need", "That is completely fine.", ["Start with the problem in your own words"]],
];

export default function SolutionFinder({ compact = false }) {
  const { divisions } = useDivisions();
  const [choice, setChoice] = useState("");
  const [detail, setDetail] = useState("");
  const selected = options.find(([key]) => key === choice);
  const division = divisions.find((item) => item.slug === choice);
  const contactQuery = new URLSearchParams({ type: choice || "unsure", ...(detail && { detail }) }).toString();

  return (
    <div className={`finder ${compact ? "finder-compact" : ""}`}>
      <div className="finder-heading">
        <span className="step-badge">01</span>
        <div>
          <p className="eyebrow">A short path to the right conversation</p>
          <h2>What are you trying to solve?</h2>
        </div>
      </div>
      <div className="finder-options" role="group" aria-label="Choose the problem type">
        {options.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={choice === key}
            className={choice === key ? "selected" : ""}
            onClick={() => { setChoice(key); setDetail(""); }}
          >
            <span>{label}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
      {selected && (
        <div className="finder-result" role="status">
          <div>
            <span className="step-badge">02</span>
            <p className="eyebrow">{selected[2]}</p>
            <div className="detail-options" role="group" aria-label={selected[2]}>
              {selected[3].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={detail === item ? "selected" : ""}
                  aria-pressed={detail === item}
                  onClick={() => setDetail(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="finder-actions">
            {division && <Link className="btn btn-secondary" to={`/solutions/${division.slug}`}>Explore {division.shortName}</Link>}
            <Link className="btn btn-primary" to={`/contact?${contactQuery}`}>Start this conversation <ArrowRight size={17} /></Link>
            <button className="reset-link" type="button" onClick={() => { setChoice(""); setDetail(""); }}>
              <RotateCcw size={14} /> Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
