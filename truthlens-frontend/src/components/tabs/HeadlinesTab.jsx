import { useApp } from "../../context/AppContext";
import { SAMPLE_HEADLINES } from "../../data/headlines";

export default function HeadlinesTab() {
  const { setInput, setActiveTab, analyze } = useApp();

  const handleClick = (h) => {
    setInput(h);
    setActiveTab("analyze");
    analyze(h);
  };

  return (
    <div className="card">
      <p className="card-title">Sample Headlines to Test</p>
      <p className="card-sub">Click any headline to analyze it instantly</p>
      <div className="headlines-list">
        {SAMPLE_HEADLINES.map((h, i) => (
          <div key={i} className="headline-item" onClick={() => handleClick(h)}>
            <span className="headline-icon">📰</span>
            <span className="headline-text">{h}</span>
            <span className="headline-arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}