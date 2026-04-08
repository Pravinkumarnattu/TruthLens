import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { KNOWN_SOURCES, getDomain } from "../data/sources";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const [sourceInfo, setSourceInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlights, setHighlights] = useState(null);
  const [rawText, setRawText] = useState("");
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("truthlens_history")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  const isURL = (str) => str.startsWith("http://") || str.startsWith("https://");

  const analyze = async (text) => {
    const target = text || input;
    if (!target.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSourceInfo(null);
    setHighlights(null);
    setRawText("");
    setSidebarOpen(false);

    if (isURL(target)) {
      const domain = getDomain(target);
      if (domain && KNOWN_SOURCES[domain]) setSourceInfo(KNOWN_SOURCES[domain]);
    }

    try {
      const payload = isURL(target) ? { url: target } : { text: target };
      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL + "/analyze", payload);
      setResult(data);

      // Store raw text for highlighting (only if not a URL)
      if (!isURL(target)) setRawText(target);

      const newEntry = {
        input: target.slice(0, 80),
        verdict: data.verdict,
        score: data.score,
        time: new Date().toLocaleTimeString(),
      };
      const updated = [newEntry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("truthlens_history", JSON.stringify(updated));
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlights = async () => {
    if (!rawText || !result?.red_flags?.length) return;
    setHighlightLoading(true);
    try {
      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL + "/highlight", {
        text: rawText,
        redFlags: result.red_flags,
      });
      setHighlights(data.highlights);
    } catch (err) {
      console.error(err);
    } finally {
      setHighlightLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("truthlens_history");
  };

  return (
    <AppContext.Provider value={{
      input, setInput,
      loading, result, error,
      darkMode, setDarkMode,
      activeTab, setActiveTab,
      sourceInfo, history, clearHistory,
      sidebarOpen, setSidebarOpen,
      highlights, fetchHighlights,
      highlightLoading, rawText,
      analyze,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);