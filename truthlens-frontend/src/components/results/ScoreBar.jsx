import { scoreColor } from "../../data/sources";

export default function ScoreBar({ score }) {
  return (
    <div className="score-section">
      <div className="score-top">
        <span className="score-label">Credibility Score</span>
        <span className="score-number" style={{ color: scoreColor(score) }}>
          {score}/100
        </span>
      </div>
      <div className="score-bar">
        <div className="score-fill" style={{
          width: `${score}%`,
          background: scoreColor(score),
        }} />
      </div>
    </div>
  );
}