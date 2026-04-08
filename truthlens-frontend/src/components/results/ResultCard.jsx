import { useState } from "react";
import VerdictBadge from "./VerdictBadge";
import ScoreBar from "./ScoreBar";
import FlagsSection from "./FlagsSection";
import { trustBg, trustColor } from "../../data/sources";

export default function ResultCard({ result, sourceInfo }) {
  const [copied, setCopied] = useState(false);

  const share = () => {
    const text = `TruthLens Analysis\n\nVerdict: ${result.verdict}\nScore: ${result.score}/100\nBias: ${result.bias_detected}\n\n${result.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card result-card">
      <VerdictBadge
        verdict={result.verdict}
        bias={result.bias_detected}
        onShare={share}
        copied={copied}
      />

      {sourceInfo && (
        <div className="source-box" style={{ background: trustBg(sourceInfo.trust) }}>
          <span className="source-label">Source:</span>
          <span className="source-name">{sourceInfo.label}</span>
          <span className="source-trust" style={{ color: trustColor(sourceInfo.trust) }}>
            {sourceInfo.trust} Trust · {sourceInfo.score}/100
          </span>
        </div>
      )}

      <ScoreBar score={result.score} />
      <p className="explanation">{result.explanation}</p>
      <FlagsSection redFlags={result.red_flags} greenFlags={result.green_flags} />
    </div>
  );
}