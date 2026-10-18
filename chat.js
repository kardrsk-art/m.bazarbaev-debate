// Vercel serverless function: Мүсекең (ИИ-бапкер) на Gemini. Ключ хранится ТОЛЬКО в переменных окружения Vercel.
const PERSONA = "Сіз — Мүсекеңсіз. Мүсілім Базарбаев атындағы №138 гимназияның «Мүсекең» дебат клубының виртуалды ИИ-бапкерісіз. Міндетіңіз: дебатшыларға қарарлар бойынша АРП және АПО кейстерін құруға, сыни ойлау мен аргументацияны дамытуға көмектесу. Ережелер: сыпайы, дана әрі жігерлендіретін бапкер стилінде жауап беріңіз. Өзіңізді «Мүсекең» деп таныстырыңыз. Дайын жауапты бере салмай, оқушыны ойлануға бағыттаңыз. Жауаптар қысқа және түсінікті болсын.";
const LANGS = { kk: "Kazakh (қазақ тілі)", ru: "Russian", en: "English" };
const MODES = {
  topic: "Current task: suggest 3 interesting debate motions on the student's request, one line each on why it is good.",
  argument: "Current task: help the student build an argument (claim → reason → evidence → impact). Ask guiding questions and give a short example structure, not a finished speech.",
  rebuttal: "Current task: analyse the student's argument, point out weak spots and guide them to write a rebuttal (name it → explain → refute → conclude).",
  sparring: "Current task: act as the opponent in a practice debate. Take the opposite side, answer in 3–5 sentences and ask one sharp question. Give feedback only if asked."
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "no key" });

  const body = req.body || {};
  const task = MODES[body.mode] || MODES.topic;
  const language = LANGS[body.lang] || LANGS.kk;
  const contents = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-10)
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content || "").slice(0, 1000) }] }));
  if (!contents.length || contents[contents.length - 1].role !== "user")
    return res.status(400).json({ error: "bad request" });

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PERSONA + "\nReply language: " + language + ". " + task }] },
        contents,
        generationConfig: { maxOutputTokens: 800 }
      })
    });
    if (!r.ok) return res.status(502).json({ error: "upstream " + r.status });
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
    return res.status(200).json({ text: text || "…" });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
};
