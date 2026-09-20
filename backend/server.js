// server.js
// Express server for CD-BOT — serves the frontend and exposes POST /api/chat.
// No external AI API is ever called here.

const path = require("path");
const express = require("express");
const { getReply } = require("./matcher");
const knowledgeBase = require("./knowledgeBase");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== "string") {
    return res.status(400).json({ error: "message must be a string" });
  }
  const { reply, suggestions } = getReply(message, knowledgeBase);
  res.json({ reply, suggestions });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", engine: "local-keyword-matcher", api: "none" });
});

app.listen(PORT, () => {
  console.log(`CyberDude Networks chatbot backend running at http://localhost:${PORT}`);
});
