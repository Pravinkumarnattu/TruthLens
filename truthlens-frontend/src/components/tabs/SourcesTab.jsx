import { KNOWN_SOURCES, scoreColor, trustBg, trustColor } from "../../data/sources";

export default function SourcesTab() {
  return (
    <div className="card">
      <p className="card-title">Source Credibility Checker</p>
      <p className="card-sub">Known credibility ratings for popular news sources</p>
      <div className="sources-list">
        {Object.entries(KNOWN_SOURCES).map(([domain, info]) => (
          <div key={domain} className="source-item">
            <div className="source-info">
              <span className="source-domain-name">{info.label}</span>
              <span className="source-domain">{domain}</span>
            </div>
            <div className="source-right">
              <div className="mini-bar">
                <div className="mini-fill" style={{
                  width: `${info.score}%`,
                  background: scoreColor(info.score),
                }} />
              </div>
              <span className="source-score" style={{ color: scoreColor(info.score) }}>
                {info.score}/100
              </span>
              <span className="trust-pill" style={{
                background: trustBg(info.trust),
                color: trustColor(info.trust),
              }}>{info.trust}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}