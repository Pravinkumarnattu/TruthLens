import { useApp } from "../../context/AppContext";
import { useEffect } from "react";
import ResultCard from "../results/ResultCard";
import HighlightCard from "../results/HighlightCard";
import ChatCard from "../results/ChatCard";
import { useConfetti } from "../../hooks/useConfetti";

export default function AnalyzeTab() {
  const { input, setInput, loading, result, error, sourceInfo, analyze } = useApp();
  const { fire } = useConfetti();

  useEffect(() => {
    if (result?.verdict) {
      fire(result.verdict);
    }
  }, [result]);

  return (
    <>
      <div className="card">
        <p className="card-title">Paste news text or a URL</p>
        <textarea
          className="input"
          rows={5}
          placeholder="Paste a headline, article text, or URL..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn" onClick={() => analyze()} disabled={loading || !input.trim()}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {loading && (
        <div className="card loading-card">
          <div className="spinner" />
          <p>Analyzing content with AI...</p>
        </div>
      )}

      {result && <ResultCard result={result} sourceInfo={sourceInfo} />}
      {result && <HighlightCard />}
      {result && <ChatCard />}
    </>
  );
}