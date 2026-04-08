import { verdictConfig, biasConfig } from "../../data/sources";

export default function VerdictBadge({ verdict, bias, onShare, copied }) {
  return (
    <div className="verdict-row">
      <span className="verdict-badge" style={{
        background: verdictConfig[verdict]?.bg,
        border: `1.5px solid ${verdictConfig[verdict]?.border}`,
        color: verdictConfig[verdict]?.text,
      }}>
        <span className="dot" style={{ background: verdictConfig[verdict]?.dot }} />
        {verdict}
      </span>

      <span className="bias-badge" style={{
        background: biasConfig[bias]?.bg,
        border: `1.5px solid ${biasConfig[bias]?.border}`,
        color: biasConfig[bias]?.text,
      }}>
        {bias} bias
      </span>

      <button className="share-btn" onClick={onShare}>
        {copied ? "✅ Copied!" : "📋 Share"}
      </button>
    </div>
  );
}