import { useApp } from "../context/AppContext";
import { verdictConfig } from "../data/sources";

const TABS = [
  { id: "analyze",   label: "🔍 Analyze" },
  { id: "headlines", label: "📰 Headlines" },
  { id: "sources",   label: "✅ Sources" },
  { id: "compare",   label: "⚖️ Compare" },
];

export default function Sidebar() {
  const { history, clearHistory, setInput, setActiveTab, activeTab, sidebarOpen, setSidebarOpen, history: h } = useApp();

  const total = history.length;
  const credible = history.filter(h => h.verdict === "Credible" || h.verdict === "Likely Credible").length;
  const fake = history.filter(h => h.verdict === "Fake" || h.verdict === "Likely Fake").length;

  const handleTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

      {/* Tabs */}
      <div className="sidebar-card sidebar-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`sidebar-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => handleTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="sidebar-card">
        <p className="sidebar-title">Session Stats</p>
        <div className="stat-grid">
          <div className="stat-box">
            <span className="stat-num">{total}</span>
            <span className="stat-label">Checked</span>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{ color: "#639922" }}>{credible}</span>
            <span className="stat-label">Credible</span>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{ color: "#E24B4A" }}>{fake}</span>
            <span className="stat-label">Fake</span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="sidebar-card">
        <p className="sidebar-title">Recent Checks</p>
        {history.length === 0 && <p className="empty-msg">No checks yet</p>}
        {history.map((h, i) => (
          <div key={i} className="history-item" onClick={() => {
            setInput(h.input);
            setActiveTab("analyze");
            setSidebarOpen(false);
          }}>
            <div className="history-text">{h.input}</div>
            <div className="history-meta">
              <span className="history-verdict" style={{
                color: verdictConfig[h.verdict]?.text,
                background: verdictConfig[h.verdict]?.bg,
              }}>{h.verdict}</span>
              <span className="history-time">{h.time}</span>
            </div>
          </div>
        ))}
        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>Clear history</button>
        )}
      </div>

    </aside>
  );
}