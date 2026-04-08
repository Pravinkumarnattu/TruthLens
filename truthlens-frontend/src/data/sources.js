export const KNOWN_SOURCES = {
  "bbc.com":          { score: 92, label: "BBC News",        trust: "High" },
  "reuters.com":      { score: 95, label: "Reuters",         trust: "High" },
  "apnews.com":       { score: 94, label: "AP News",         trust: "High" },
  "theguardian.com":  { score: 88, label: "The Guardian",    trust: "High" },
  "nytimes.com":      { score: 90, label: "New York Times",  trust: "High" },
  "foxnews.com":      { score: 61, label: "Fox News",        trust: "Medium" },
  "cnn.com":          { score: 75, label: "CNN",             trust: "Medium" },
  "dailymail.co.uk":  { score: 42, label: "Daily Mail",      trust: "Low" },
  "infowars.com":     { score: 5,  label: "InfoWars",        trust: "Very Low" },
  "naturalnews.com":  { score: 8,  label: "Natural News",    trust: "Very Low" },
};

export const verdictConfig = {
  "Credible":        { bg: "#EAF3DE", border: "#639922", text: "#27500A", dot: "#639922" },
  "Likely Credible": { bg: "#E1F5EE", border: "#1D9E75", text: "#085041", dot: "#1D9E75" },
  "Uncertain":       { bg: "#FAEEDA", border: "#BA7517", text: "#633806", dot: "#EF9F27" },
  "Likely Fake":     { bg: "#FAECE7", border: "#993C1D", text: "#4A1B0C", dot: "#D85A30" },
  "Fake":            { bg: "#FCEBEB", border: "#A32D2D", text: "#501313", dot: "#E24B4A" },
};

export const biasConfig = {
  "Left":    { bg: "#E6F1FB", border: "#185FA5", text: "#0C447C" },
  "Right":   { bg: "#FCEBEB", border: "#A32D2D", text: "#501313" },
  "Neutral": { bg: "#F1EFE8", border: "#5F5E5A", text: "#2C2C2A" },
  "Unknown": { bg: "#F1EFE8", border: "#5F5E5A", text: "#2C2C2A" },
};

export const scoreColor = (score) => {
  if (score >= 70) return "#639922";
  if (score >= 40) return "#EF9F27";
  return "#E24B4A";
};

export const trustColor = (trust) => {
  if (trust === "High") return "#27500A";
  if (trust === "Medium") return "#633806";
  return "#501313";
};

export const trustBg = (trust) => {
  if (trust === "High") return "#EAF3DE";
  if (trust === "Medium") return "#FAEEDA";
  return "#FCEBEB";
};

export const getDomain = (url) => {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return null; }
};