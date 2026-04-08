import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Scrape article text from a URL ──────────────────────────────
async function scrapeArticle(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 8000,
  });
  const $ = cheerio.load(data);
  $("script, style, nav, footer, header, aside").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);
}

// ── Build the AI prompt ─────────────────────────────────────────
function buildPrompt(text) {
  return `
You are a professional fact-checker trained to detect misinformation with high precision.

Analyze the following news content and return ONLY valid JSON (no markdown, no backticks):

{
  "score": <0-100, where 100 = fully credible>,
  "verdict": "<Credible | Likely Credible | Uncertain | Likely Fake | Fake>",
  "red_flags": ["<flag1>", "<flag2>"],
  "green_flags": ["<flag1>"],
  "explanation": "<2-3 sentence summary of your reasoning>",
  "bias_detected": "<Left | Right | Neutral | Unknown>"
}

STEP 1 — CLASSIFY THE CONTENT TYPE FIRST:
Before scoring, identify what kind of content this is:
- TYPE A: Clear misinformation / conspiracy / impossible claim
- TYPE B: Misleading claim dressed as fact
- TYPE C: Plausible real-world claim, missing sources
- TYPE D: Factual reporting with partial sourcing
- TYPE E: Well-sourced factual reporting with named experts or institutions

STEP 2 — APPLY SCORING BY TYPE:
- TYPE A → score 0–20, verdict: Fake
- TYPE B → score 21–40, verdict: Likely Fake
- TYPE C → score 41–60, verdict: Uncertain
- TYPE D → score 61–80, verdict: Likely Credible
- TYPE E → score 81–95, verdict: Credible
- Never give 100

STEP 3 — APPLY THESE SIGNALS:

RED FLAG signals (lower the score):
- No named sources, no institutions cited
- Conspiracy language ("hidden from public", "they don't want you to know")
- Impossible or supernatural claims
- Absolute predictions ("will completely", "within months", "100%")
- Anonymous insiders as only source
- Emotional manipulation ("SHOCKING", "Share before deleted")
- Repeating a false claim even while denying it

GREEN FLAG signals (raise the score):
- Named expert, researcher, or official quoted
- Reference to a specific study, report, or institution
- Calm, neutral, factual tone
- Specific dates, locations, or verifiable details
- Multiple perspectives presented
- Content matches known real-world events

STEP 4 — CREDIBLE NEWS CALIBRATION:
These patterns indicate TYPE D or E — do NOT score below 60:
- Mentions a real organization (NASA, WHO, government body, university)
- References a named person with a title or role
- Describes a realistic event (study results, policy changes, product launches)
- Contains specific measurable claims (percentages, timeframes, locations)
- Written in calm, journalistic tone with no sensationalism

HEADLINE-ONLY CONTENT RULE (VERY IMPORTANT):
- If the content is just a headline or single sentence with no body text:
  → Do NOT score below 40 just because details are missing
  → Headlines are naturally brief — absence of sources is expected
  → Judge only the CLAIM itself: Is it plausible? Is it from a real institution?
  → If the claim involves a real institution (NASA, WHO, UN) + a plausible scientific topic:
     score between 45–65, verdict: Uncertain
  → If the claim is impossible or conspiracy-level even as a headline:
     score below 25

STEP 5 — FAKE NEWS CALIBRATION:
These patterns indicate TYPE A or B — score MUST be below 40:
- Mind control, secret frequencies, hidden cures
- "Anonymous government insider" as sole source
- Urges reader to share before deletion
- Claims that defy established science without counter-evidence
- Self-debunking without citing WHO proved it fake and HOW

FINAL CHECK:
- Is the core claim physically possible? → If no, score below 20
- Does it cite at least one real, named source? → If yes, score above 60
- Is the tone calm and factual? → If yes, add 10 points
- Does it make absolute predictions with no evidence? → If yes, subtract 20 points

OUTPUT RULES:
- Return ONLY JSON, no extra text
- explanation must be 2–3 sentences, specific to this content
- red_flags and green_flags must be specific, not generic

News content:
"""${text}"""
  `.trim();
}

// ── POST /analyze ───────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  try {
    const { text, url } = req.body;

    if (!text && !url) {
      return res.status(400).json({ error: "Provide either text or a URL." });
    }

    // Get article content
    let content = text;
    if (url) {
      try {
        content = await scrapeArticle(url);
      } catch {
        return res
          .status(422)
          .json({ error: "Could not fetch article from that URL." });
      }
    }

    if (!content || content.length < 30) {
      return res.status(400).json({ error: "Not enough content to analyze." });
    }

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: buildPrompt(content) }],
      max_tokens: 1024,
    });
    const raw = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Analysis failed. Please try again." });
  }
});

// ── POST /highlight ─────────────────────────────────────────────
app.post("/highlight", async (req, res) => {
  try {
    const { text, redFlags } = req.body;

    if (!text || !redFlags?.length) {
      return res.status(400).json({ error: "Provide text and red flags." });
    }

    const prompt = `
You are a media literacy expert. Given the article text and its red flags, identify which exact sentences or phrases trigger each red flag.

Return ONLY valid JSON (no markdown, no backticks):
{
  "highlights": [
    {
      "sentence": "<exact sentence or phrase from the text>",
      "reason": "<red flag label>",
      "severity": "<high | medium>"
    }
  ]
}

Rules:
- Only include sentences that ACTUALLY appear in the text
- Copy the sentence EXACTLY as it appears — do not paraphrase
- Maximum 5 highlights
- severity "high" for strong red flags, "medium" for moderate ones

Red flags: ${redFlags.join(", ")}

Article text:
"""${text.slice(0, 3000)}"""
    `.trim();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    const raw = completion.choices[0].message.content.trim();
    const result = JSON.parse(raw);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Highlight failed." });
  }
});

// ── POST /chat ──────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { system, messages } = req.body;

    if (!messages?.length) {
      return res.status(400).json({ error: "No messages provided." });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      max_tokens: 512,
      messages: [{ role: "system", content: system }, ...messages],
    });

    const reply = completion.choices[0].message.content.trim();
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Chat failed. Try again." });
  }
});

// ── Health check ────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "TruthLens API running ✓" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
