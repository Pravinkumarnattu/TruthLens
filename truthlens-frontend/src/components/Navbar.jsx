import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { darkMode, setDarkMode, sidebarOpen, setSidebarOpen, history } = useApp();
  const [copied, setCopied] = useState(false);

  const total = history.length;
  const fakeCount = history.filter(h => h.verdict === "Fake" || h.verdict === "Likely Fake").length;
  const accuracy = total > 0 ? Math.round(((total - fakeCount) / total) * 100) : null;

  const handleShare = async () => {
    const text = `🔍 TruthLens Session Summary\n\nArticles Analyzed: ${total}\nFake Detected: ${fakeCount}\nCredible Rate: ${accuracy !== null ? `${accuracy}%` : "N/A"}\n\nPowered by TruthLens AI`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "TruthLens Results", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <div className="nav-brand">🔍 TruthLens</div>
        <span className="nav-badge">AI Powered</span>
      </div>

      <div className="nav-stats">
        <div className="nav-stat">
          <span className="nav-stat-num">{total}</span>
          <span className="nav-stat-label">Analyzed</span>
        </div>
        <div className="nav-divider" />
        <div className="nav-stat">
          <span className="nav-stat-num" style={{ color: "#E24B4A" }}>{fakeCount}</span>
          <span className="nav-stat-label">Fake detected</span>
        </div>
        <div className="nav-divider" />
        <div className="nav-stat">
          <span className="nav-stat-num" style={{ color: "#639922" }}>
            {accuracy !== null ? `${accuracy}%` : "—"}
          </span>
          <span className="nav-stat-label">Credible rate</span>
        </div>
      </div>

      <div className="nav-right">
        <a href="https://docs.anthropic.com" target="_blank" rel="noreferrer" className="nav-action">
          📖 Docs
        </a>
        <button className="nav-action" onClick={handleShare}>
          {copied ? "✅ Copied!" : "📤 Share"}
        </button>
        <button className="dark-toggle" onClick={() => setDarkMode(d => !d)}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}