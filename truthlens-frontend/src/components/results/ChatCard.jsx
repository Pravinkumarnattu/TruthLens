import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import axios from "axios";

const SUGGESTED = [
  "Why is this fake?",
  "What's the truth about this?",
  "Explain the red flags simply",
  "Where can I find a credible source?",
];

export default function ChatCard() {
  const { result } = useApp();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `I've analyzed this article and found a credibility score of ${result?.score}/100 with a verdict of "${result?.verdict}". Ask me anything about it!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = () => `
You are a media literacy expert who just analyzed a news article.

Here is the full analysis:
- Verdict: ${result?.verdict}
- Credibility Score: ${result?.score}/100
- Bias: ${result?.bias_detected}
- Red Flags: ${result?.red_flags?.join(", ") || "None"}
- Green Flags: ${result?.green_flags?.join(", ") || "None"}
- Explanation: ${result?.explanation}

Answer the user's questions about this article clearly and simply.
Keep answers concise — 2 to 4 sentences max.
Do not repeat the full analysis unless asked.
  `.trim();

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const userMsg = { role: "user", text: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = updated.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      }));

      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL + "/chat", {
        system: buildSystemPrompt(),
        messages: chatHistory,
      });

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="card chat-card">
      <p className="card-title">💬 Ask about this article</p>
      <p className="card-sub">Ask anything about the analysis, red flags, or the topic</p>

      {/* Suggested questions */}
      <div className="chat-suggestions">
        {SUGGESTED.map((q, i) => (
          <button key={i} className="suggestion-chip" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <span className="chat-avatar">{m.role === "assistant" ? "🤖" : "👤"}</span>
            <div className="chat-text">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <span className="chat-avatar">🤖</span>
            <div className="chat-text chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Ask anything about this article..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          className="chat-send"
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          →
        </button>
      </div>
    </div>
  );
}