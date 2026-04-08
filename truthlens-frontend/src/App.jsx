import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AnalyzeTab from "./components/tabs/AnalyzeTab";
import HeadlinesTab from "./components/tabs/HeadlinesTab";
import SourcesTab from "./components/tabs/SourcesTab";
import CompareTab from "./components/tabs/CompareTab";
import "./App.css";

function Dashboard() {
  const { activeTab, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="root">
      <Navbar />
      <div className="dashboard">
        {sidebarOpen && (
          <div className="overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <Sidebar />
        <main className="main">
          {activeTab === "analyze" && <AnalyzeTab />}
          {activeTab === "headlines" && <HeadlinesTab />}
          {activeTab === "sources" && <SourcesTab />}
          {activeTab === "compare" && <CompareTab />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
