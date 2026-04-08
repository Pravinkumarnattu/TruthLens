import { useState } from "react";
import axios from "axios";
import { verdictConfig, scoreColor, biasConfig } from "../../data/sources";

function ArticleColumn({ label, result, loading, error }) {
  if (loading) {
    return (
      <div className="compare-col">
        <p className="compare-col-label">{label}</p>
        <div className="compare-loading">
          <div className="spinner" />
          <span>Analyzing...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compare-col">
        <p className="compare-col-label">{label}</p>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="compare-col compare-col-empty">
        <p className="compare-col-label">{label}</p>
        <p className="compare-placeholder">Result will appear here</p>
      </div>
    );
  }

  return (
    <div className="compare-col">
      <p className="compare-col-label">{label}</p>

      {/* Verdict */}
      <span className="verdict-badge" style={{
        background: verdictConfig[result.verdict]?.bg,
        border: `1.5px solid ${verdictConfig[result.verdict]?.border}`,
        color: verdictConfig[result.verdict]?.text,
        marginBottom: "1rem",
        display: "inline-flex",
      }}>
        <span className="dot" style={{ background: verdictConfig[result.verdict]?.dot }} />
        {result.verdict}
      </span>

      {/* Score */}
      <div className="score-section">
        <div className="score-top">
          <span className="score-label">Credibility Score</span>
          <span className="score-number" style={{ color: scoreColor(result.score) }}>
            {result.score}/100
          </span>
        </div>
        <div className="score-bar">
          <div className="score-fill" style={{
            width: `${result.score}%`,
            background: scoreColor(result.score),
          }} />
        </div>
      </div>

      {/* Bias Badge */}
      <span className="bias-badge" style={{
        background: biasConfig[result.bias_detected]?.bg,
        border: `1.5px solid ${biasConfig[result.bias_detected]?.border}`,
        color: biasConfig[result.bias_detected]?.text,
        display: "inline-flex",
        marginBottom: "0.5rem",
      }}>
        {result.bias_detected} bias
      </span>

      {/* Explanation */}
      <p className="explanation">{result.explanation}</p>

      {/* Flags */}
      {result.red_flags?.length > 0 && (
        <div className="flags-section" style={{ marginBottom: "0.75rem" }}>
          <p className="flags-title red">🚩 Red Flags</p>
          <div className="chips">
            {result.red_flags.map((f, i) => (
              <span key={i} className="chip red-chip">{f}</span>
            ))}
          </div>
        </div>
      )}
      {result.green_flags?.length > 0 && (
        <div className="flags-section">
          <p className="flags-title green">✅ Green Flags</p>
          <div className="chips">
            {result.green_flags.map((f, i) => (
              <span key={i} className="chip green-chip">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompareTab() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState(null);
  const [errorB, setErrorB] = useState(null);
  const [compared, setCompared] = useState(false);

  const isURL = (str) => str.startsWith("http://") || str.startsWith("https://");

  const analyzeOne = async (text, setResult, setLoading, setError) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = isURL(text) ? { url: text } : { text };
      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL + "/analyze", payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setCompared(true);
    setResultA(null);
    setResultB(null);
    await Promise.all([
      analyzeOne(textA, setResultA, setLoadingA, setErrorA),
      analyzeOne(textB, setResultB, setLoadingB, setErrorB),
    ]);
  };

  const reset = () => {
    setTextA(""); setTextB("");
    setResultA(null); setResultB(null);
    setErrorA(null); setErrorB(null);
    setCompared(false);
  };

  const getWinner = () => {
    if (!resultA || !resultB) return null;
    if (resultA.score > resultB.score) return "A";
    if (resultB.score > resultA.score) return "B";
    return "tie";
  };

  const winner = getWinner();

  return (
    <div className="compare-wrapper">

      {!compared && (
        <div className="card">
          <p className="card-title">Side-by-side Comparison</p>
          <p className="card-sub">Paste two articles or URLs about the same topic to compare their credibility</p>
          <div className="compare-inputs">
            <div className="compare-input-col">
              <label className="compare-input-label">Article A</label>
              <textarea
                className="input"
                rows={6}
                placeholder="Paste article A text or URL..."
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
              />
            </div>
            <div className="compare-vs">VS</div>
            <div className="compare-input-col">
              <label className="compare-input-label">Article B</label>
              <textarea
                className="input"
                rows={6}
                placeholder="Paste article B text or URL..."
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn"
            onClick={handleCompare}
            disabled={!textA.trim() || !textB.trim()}
          >
            Compare Articles
          </button>
        </div>
      )}

      {compared && (
        <>
          {winner && (
            <div className={`winner-banner ${winner === "tie" ? "tie" : ""}`}>
              {winner === "tie"
                ? "🤝 Both articles scored equally"
                : `🏆 Article ${winner} is more credible`}
            </div>
          )}

          <div className="card compare-results">
            <ArticleColumn label="Article A" result={resultA} loading={loadingA} error={errorA} />
            <div className="compare-divider" />
            <ArticleColumn label="Article B" result={resultB} loading={loadingB} error={errorB} />
          </div>

          <button className="compare-reset" onClick={reset}>
            ← Compare new articles
          </button>
        </>
      )}

    </div>
  );
}