import { useApp } from "../../context/AppContext";

function applyHighlights(text, highlights) {
  if (!highlights?.length) return [{ part: text, highlight: null }];

  let result = [{ part: text, highlight: null }];

  highlights.forEach(({ sentence, reason, severity }) => {
    result = result.flatMap(({ part, highlight }) => {
      if (highlight) return [{ part, highlight }];
      const idx = part.indexOf(sentence);
      if (idx === -1) return [{ part, highlight: null }];
      return [
        { part: part.slice(0, idx), highlight: null },
        { part: sentence, highlight: { reason, severity } },
        { part: part.slice(idx + sentence.length), highlight: null },
      ].filter(s => s.part);
    });
  });

  return result;
}

export default function HighlightCard() {
  const { rawText, highlights, fetchHighlights, highlightLoading, result } = useApp();

  if (!rawText || !result?.red_flags?.length) return null;

  const segments = highlights ? applyHighlights(rawText, highlights) : null;

  return (
    <div className="card highlight-card">
      <div className="highlight-header">
        <div>
          <p className="card-title">Suspicious Sentence Highlighter</p>
          <p className="card-sub">See exactly which sentences triggered the red flags</p>
        </div>
        {!highlights && (
          <button
            className="highlight-btn"
            onClick={fetchHighlights}
            disabled={highlightLoading}
          >
            {highlightLoading ? "Scanning..." : "🔦 Scan Text"}
          </button>
        )}
      </div>

      {highlightLoading && (
        <div className="highlight-loading">
          <div className="spinner" />
          <span>Scanning for suspicious sentences...</span>
        </div>
      )}

      {segments && (
        <>
          <div className="highlight-text">
            {segments.map((seg, i) =>
              seg.highlight ? (
                <span
                  key={i}
                  className={`hl hl-${seg.highlight.severity}`}
                  title={seg.highlight.reason}
                >
                  {seg.part}
                  <span className="hl-tooltip">{seg.highlight.reason}</span>
                </span>
              ) : (
                <span key={i}>{seg.part}</span>
              )
            )}
          </div>

          {/* Legend */}
          <div className="hl-legend">
            <span className="hl-legend-item">
              <span className="hl-dot hl-high" /> High severity
            </span>
            <span className="hl-legend-item">
              <span className="hl-dot hl-medium" /> Medium severity
            </span>
            <span className="hl-legend-item hl-tip">Hover a highlight to see reason</span>
          </div>
        </>
      )}
    </div>
  );
}