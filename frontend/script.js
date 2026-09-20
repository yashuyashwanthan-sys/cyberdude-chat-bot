// script.js — Cyber Dude Duty widget frontend.
// Talks to POST /api/chat, renders bot/user bubbles, a typing indicator,
// clickable follow-up suggestion chips, tap-to-call/email/map links inside
// answers, and voice input via the browser's built-in Web Speech API.
// 100% offline architecture: no external AI API, no external network calls
// anywhere in this file — localStorage, Web Audio, and Web Speech are all
// native browser features with zero server round-trips.

const launcher = document.getElementById("launcher");
const panel = document.getElementById("panel");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximizeBtn");
const log = document.getElementById("log");
const suggestionsBar = document.getElementById("suggestions");
const composer = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = composer.querySelector(".send-btn");
const micBtn = document.getElementById("micBtn");
const composerFoot = document.getElementById("composerFoot");
const agentBtn = document.getElementById("agentBtn");
const agentModal = document.getElementById("agentModal");
const agentModalClose = document.getElementById("agentModalClose");

let opened = false;
let greeted = false;

// =======================================================================
// OFFLINE ABUSE DETECTION & USER BLOCKING — 100% local, zero network calls.
// A simple local word-list check runs on every outgoing user message.
// Repeated abuse increments a strike counter in localStorage; hitting the
// limit sets a 24-hour expiry timestamp that keeps the chat UI (and the
// Connect with Agent button) locked out until it passes — even across
// page reloads. Nothing here ever contacts the server.
// =======================================================================
const BAD_WORDS = [
  "fuck", "fucking", "fucker", "shit", "bullshit", "bitch", "bastard",
  "asshole", "ass", "dick", "piss", "cunt", "slut", "whore", "damn",
  "crap", "idiot", "stupid", "moron", "dumb", "retard", "fool", "fools"
];

const STRIKES_KEY = "abuse_strikes";
const EXPIRY_KEY = "cd_block_expiry";
const STRIKE_LIMIT = 3; // set to 1 for an instant one-strike block instead
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24-hour cool-off

function getStrikes() {
  try {
    return parseInt(localStorage.getItem(STRIKES_KEY), 10) || 0;
  } catch (err) {
    return 0; // storage unavailable — fail open on counting, never crash
  }
}

function setStrikes(n) {
  try {
    localStorage.setItem(STRIKES_KEY, String(n));
  } catch (err) {
    // storage unavailable — strike just won't persist across reloads
  }
}

function getBlockExpiry() {
  try {
    const raw = localStorage.getItem(EXPIRY_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch (err) {
    return null;
  }
}

function setBlockExpiry(timestamp) {
  try {
    localStorage.setItem(EXPIRY_KEY, String(timestamp));
  } catch (err) {
    // storage unavailable — block still applies this session via in-memory checks below
  }
}

// Clears the block AND resets strikes to 0 — used both when a block
// naturally expires after 24 hours and would be used for a manual reset.
function clearBlock() {
  try {
    localStorage.removeItem(EXPIRY_KEY);
  } catch (err) {
    /* ignore */
  }
  setStrikes(0);
}

// Returns true if currently blocked. As a side effect, automatically
// clears (and resets strikes for) a block whose 24-hour expiry has
// already passed — this is what makes the cool-off "automatic": the very
// next page load or chat attempt after the 24 hours lifts it with no
// extra step needed.
function isBlocked() {
  const expiry = getBlockExpiry();
  if (!expiry) return false;
  if (Date.now() >= expiry) {
    clearBlock();
    return false;
  }
  return true;
}

// Whole-word match only, via regex word boundaries — so "class" or
// "passion" never falsely trips on containing "ass" as a substring.
function containsBadWord(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(lower);
  });
}

// e.g. 1425 minutes remaining -> "23h 45m"
function formatRemaining(ms) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function applyBlockedUI() {
  const expiry = getBlockExpiry();
  const remainingMs = expiry ? expiry - Date.now() : 0;
  input.disabled = true;
  input.placeholder = `Access Blocked: Try again in ${formatRemaining(remainingMs)}`;
  input.value = "";
  sendBtn.disabled = true; // existing .send-btn:disabled CSS already grays it out
  micBtn.disabled = true;
  micBtn.classList.add("blocked");
  agentBtn.classList.add("blocked"); // grayed via CSS, but stays clickable (see agentBtn handler) so the "Access Denied" alert can fire
  suggestionsBar.innerHTML = ""; // remove any leftover clickable suggestion chips too
}

function clearBlockedUI() {
  input.disabled = false;
  input.placeholder = "Ask about services, pricing, careers…";
  sendBtn.disabled = false;
  micBtn.disabled = false;
  micBtn.classList.remove("blocked");
  agentBtn.classList.remove("blocked");
}

function handleAbuseStrike() {
  const strikes = getStrikes() + 1;
  setStrikes(strikes);

  if (strikes >= STRIKE_LIMIT) {
    setBlockExpiry(Date.now() + BLOCK_DURATION_MS);
    applyBlockedUI();
    addMessage("bot", "You've been blocked after repeated abusive language. This chat and agent support are locked on this device for 24 hours.");
  } else {
    addMessage(
      "bot",
      `That kind of language isn't okay here. Strike ${strikes}/${STRIKE_LIMIT} — reaching ${STRIKE_LIMIT} will block this chat for 24 hours.`
    );
  }
}

// =======================================================================
// FEATURE 1 — LocalStorage chat history: persists full conversation so it
// reloads automatically on refresh/reopen. Stored entirely client-side,
// no server involved.
// =======================================================================
const HISTORY_KEY = "cd_chat_history";
const SUGGESTIONS_KEY = "cd_chat_last_suggestions";
const MAX_HISTORY = 100; // cap so localStorage never grows unbounded

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return []; // corrupted or inaccessible storage — start fresh, never throw
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory.slice(-MAX_HISTORY)));
  } catch (err) {
    // localStorage full/disabled (e.g. private browsing) — fail silently,
    // chat still works for the current session, just won't persist
  }
}

let chatHistory = loadHistory();

function togglePanel(force) {
  opened = typeof force === "boolean" ? force : !opened;
  panel.classList.toggle("open", opened);
  launcher.classList.toggle("open", opened);
  if (opened) {
    input.focus();
    if (!greeted) {
      greeted = true;
      setTimeout(() => sendMessage("hi", { silent: true }), 350);
    }
  }
}

launcher.addEventListener("click", () => togglePanel());
minimizeBtn.addEventListener("click", () => togglePanel(false));

// =======================================================================
// Maximize/Minimize (compact <-> near-full-height) toggle for the widget
// itself — separate from the open/close launcher toggle above. Swaps the
// icon between "expand" and "compress" and flips the .maximized class,
// which is what actually changes the panel's height (see style.css).
// =======================================================================
const EXPAND_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const COMPRESS_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let isMaximized = false;

function setMaximized(value) {
  isMaximized = value;
  panel.classList.toggle("maximized", isMaximized);
  maximizeBtn.innerHTML = isMaximized ? COMPRESS_ICON : EXPAND_ICON;
  maximizeBtn.setAttribute("aria-label", isMaximized ? "Restore chat size" : "Maximize chat");
  scrollToBottom(); // panel height just changed — keep the latest message in view
}

maximizeBtn.addEventListener("click", () => setMaximized(!isMaximized));

function scrollToBottom() {
  log.scrollTop = log.scrollHeight;
}

// ---------------------------------------------------------------------
// Linkify: turn phone numbers / emails / the office address inside a bot
// reply into tap-to-call, tap-to-email, and tap-to-map links. Escapes HTML
// first so nothing in the knowledge base text can break the markup.
// ---------------------------------------------------------------------
const OFFICE_ADDRESS = "#32, Second Street, Ramalingapuram, Kamaraj Nagar, Avadi, Chennai – 600 071";

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function linkify(text) {
  let safe = escapeHtml(text);

  safe = safe.replace(/(\+91[\s-]?\d{10})/g, (match) => {
    const dial = match.replace(/[\s-]/g, "");
    return `<a href="tel:${dial}">${match}</a>`;
  });

  safe = safe.replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, (match) => {
    return `<a href="mailto:${match}">${match}</a>`;
  });

  const escapedAddress = escapeHtml(OFFICE_ADDRESS);
  if (safe.includes(escapedAddress)) {
    const mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(OFFICE_ADDRESS);
    safe = safe.replace(escapedAddress, `<a href="${mapUrl}" target="_blank" rel="noopener">${escapedAddress}</a>`);
  }

  return safe;
}

// `persist: false` is used when re-rendering saved history on load, so we
// don't re-append the same messages back onto themselves.
function addMessage(role, text, opts = {}) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "m-avatar";
  avatar.textContent = role === "bot" ? "CDD" : "YOU";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "bot") {
    bubble.innerHTML = linkify(text); // safe: escapeHtml() runs first inside linkify()
  } else {
    bubble.textContent = text;
  }
  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  log.appendChild(wrap);

  // FEATURE 3 — auto-scroll to bottom whenever a new message appears
  scrollToBottom();

  if (opts.persist !== false) {
    chatHistory.push({ role, text });
    saveHistory();
  }
  return wrap;
}

function showTyping() {
  const wrap = document.createElement("div");
  wrap.className = "msg bot typing";
  wrap.innerHTML = `
    <div class="m-avatar">CDD</div>
    <div class="bubble">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
    </div>`;
  log.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function renderSuggestions(list, opts = {}) {
  suggestionsBar.innerHTML = "";
  (list || []).forEach((q) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = q;
    chip.addEventListener("click", () => sendMessage(q));
    suggestionsBar.appendChild(chip);
  });
  // FEATURE 3 — suggestion chips can push the log's visible area, so
  // re-confirm we're pinned to the bottom after they render too.
  scrollToBottom();

  if (opts.persist !== false) {
    try {
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(list || []));
    } catch (err) {
      // storage unavailable — suggestion chips just won't survive reload
    }
  }
}

// Replays saved history into the DOM on load, without re-persisting it
// (opts.persist:false everywhere here) and without re-triggering the "hi"
// auto-greeting. Returns true if there was history to restore.
function restoreHistory() {
  if (chatHistory.length === 0) return false;
  for (const entry of chatHistory) {
    addMessage(entry.role, entry.text, { persist: false });
  }
  let lastSuggestions = [];
  try {
    lastSuggestions = JSON.parse(localStorage.getItem(SUGGESTIONS_KEY) || "[]");
  } catch (err) {
    lastSuggestions = [];
  }
  renderSuggestions(lastSuggestions, { persist: false });
  return true;
}

// =======================================================================
// LOCAL DATE ANSWERS — answers date/day/today questions using the
// device's own system clock, entirely client-side. This runs BEFORE the
// knowledgeBase.js/backend lookup, so for these questions /api/chat is
// never called at all — zero backend involvement, zero network call.
// =======================================================================
const DATE_QUERY_PATTERN = /\b(date|today|day)\b/i;

function getLocalDateReply() {
  const formatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  return `Today is ${formatted}.`;
}

const DATE_REPLY_SUGGESTIONS = ["What services do you offer?", "How do I contact you?", "What's your journey/history?"];

async function sendMessage(text, opts = {}) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Already blocked — refuse to send anything at all, even if this call
  // somehow bypassed the disabled input (defense in depth).
  if (isBlocked()) {
    applyBlockedUI();
    return;
  }

  if (!opts.silent) {
    addMessage("user", trimmed);

    if (containsBadWord(trimmed)) {
      handleAbuseStrike();
      input.value = "";
      return; // abusive messages never reach the matcher/backend
    }
  }

  suggestionsBar.innerHTML = "";
  input.value = "";
  sendBtn.disabled = true;

  const typingEl = showTyping();
  const delay = 500 + Math.random() * 500;

  try {
    let reply, suggestions;

    if (DATE_QUERY_PATTERN.test(trimmed)) {
      // Local system-clock answer — no fetch, no backend, no knowledgeBase
      // lookup at all for this message.
      reply = getLocalDateReply();
      suggestions = DATE_REPLY_SUGGESTIONS;
    } else {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });
      const data = await res.json();
      reply = data.reply;
      suggestions = data.suggestions;
    }

    await new Promise((r) => setTimeout(r, delay));
    typingEl.remove();
    addMessage("bot", reply);
    renderSuggestions(suggestions);
  } catch (err) {
    await new Promise((r) => setTimeout(r, 300));
    typingEl.remove();
    addMessage("bot", "Hmm, I couldn't reach the server. Is it running?");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(input.value);
});

// =======================================================================
// FEATURE 2 — Mic audio cues: short local "ting" tones on start/stop of
// speech recognition, synthesized via the Web Audio API. No audio file,
// no network fetch — the tone is generated entirely in-browser.
// =======================================================================
function playTing(freq, duration = 0.12) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch (err) {
    // Web Audio unavailable in this browser — never let a missing sound
    // cue block the actual mic functionality
  }
}

// ---------------------------------------------------------------------
// Voice input — uses the browser's built-in Web Speech API. No server
// call, no API key, no external AI: native browser functionality only.
// ---------------------------------------------------------------------
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;
const DEFAULT_FOOT_TEXT = composerFoot.textContent;

if (SpeechRecognitionCtor) {
  recognition = new SpeechRecognitionCtor();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("result", (e) => {
    const transcript = e.results[0][0].transcript;
    stopListening();
    sendMessage(transcript);
  });
  recognition.addEventListener("end", () => stopListening());
  recognition.addEventListener("error", () => stopListening());
} else {
  micBtn.classList.add("unsupported");
}

function startListening() {
  if (!recognition || listening) return;
  listening = true;
  micBtn.classList.add("listening");
  composerFoot.textContent = "Listening… speak now";
  playTing(880); // higher-pitched "ting" = start listening
  try {
    recognition.start();
  } catch (err) {
    stopListening();
  }
}

function stopListening() {
  const wasListening = listening;
  listening = false;
  micBtn.classList.remove("listening");
  composerFoot.textContent = DEFAULT_FOOT_TEXT;
  if (wasListening) playTing(440); // lower-pitched "ting" = stop listening
  if (recognition) {
    try { recognition.stop(); } catch (err) { /* already stopped */ }
  }
}

micBtn.addEventListener("click", () => {
  if (listening) stopListening();
  else startListening();
});

// =======================================================================
// FEATURE 5 — Connect with Agent: shows local support contact info in a
// modal. No fetch/XHR/network call of any kind — tel:/mailto: links are a
// native device action, not a server round-trip.
// =======================================================================
function openAgentModal() {
  agentModal.classList.add("open");
}
function closeAgentModal() {
  agentModal.classList.remove("open");
}
agentBtn.addEventListener("click", () => {
  if (isBlocked()) {
    alert("Access Denied: Support access is temporarily restricted due to policy violations.");
    return;
  }
  openAgentModal();
});
agentModalClose.addEventListener("click", closeAgentModal);
agentModal.addEventListener("click", (e) => {
  if (e.target === agentModal) closeAgentModal(); // click on the backdrop closes it
});

// =======================================================================
// FEATURE 6 — Automated "nightly" update marker. Compares the current
// calendar day (new Date().toDateString()) against the last-seen day
// stored locally. On a date rollover, it "re-indexes" — a no-op here since
// the knowledge base is a static file, so re-indexing just means updating
// the local marker/log — and CRUCIALLY never touches cd_chat_history, so
// past conversation is always preserved across the rollover.
// =======================================================================
const REINDEX_KEY = "cd_last_reindex_date";

function checkNightlyReindex() {
  const today = new Date().toDateString();
  let lastDate = null;
  try {
    lastDate = localStorage.getItem(REINDEX_KEY);
  } catch (err) {
    return; // storage unavailable — skip silently, never touches chat history either way
  }
  if (lastDate !== today) {
    reindexKnowledgeBase(today);
  }
}

function reindexKnowledgeBase(today) {
  // The knowledge base (knowledgeBase.js) is static and served fresh on
  // every page load already, so there is nothing to rebuild client-side —
  // this just timestamps that a new day's cycle has started. chatHistory /
  // cd_chat_history is intentionally NEVER cleared or touched here.
  try {
    localStorage.setItem(REINDEX_KEY, today);
  } catch (err) {
    return;
  }
  console.info(
    `[Cyber Dude Duty] Nightly reindex marker updated for ${today}. ` +
    `Knowledge base is static (no rebuild needed). ` +
    `Chat history preserved (${chatHistory.length} message(s) untouched).`
  );
}

checkNightlyReindex();
// Re-check every minute while the tab is open, in case it's left open
// across an actual midnight rollover.
setInterval(checkNightlyReindex, 60 * 1000);

// Keeps the "Try again in Xh Ym" countdown fresh while the tab stays open,
// and automatically lifts the block the moment the 24 hours pass — without
// needing a page reload. isBlocked() itself does the expiry check/auto-clear;
// this just decides whether the UI needs to flip back to normal or just
// refresh its remaining-time text.
function tickBlockStatus() {
  const wasTracked = !!getBlockExpiry();
  const stillBlocked = isBlocked();
  if (wasTracked && !stillBlocked) {
    clearBlockedUI();
  } else if (stillBlocked) {
    applyBlockedUI();
  }
}
setInterval(tickBlockStatus, 60 * 1000);

// =======================================================================
// Restore any saved conversation, then open the widget.
// FEATURE 7 — 3-second startup delay before the widget auto-opens.
// =======================================================================
greeted = restoreHistory(); // if there's saved history, skip the "hi" auto-greeting

// Persistence check: if this device was already blocked in a previous
// session, re-apply the locked-out UI immediately on load, before the
// user can type anything.
if (isBlocked()) {
  applyBlockedUI();
}

setTimeout(() => togglePanel(true), 3000);
