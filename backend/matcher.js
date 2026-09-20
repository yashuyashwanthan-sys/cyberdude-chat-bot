// matcher.js
// The "brain" of CD-BOT — a small handmade keyword/intent matching engine.
// No external NLP library, no AI API. Just: normalize -> tokenize ->
// remove stopwords -> stem -> score every intent -> pick best / fallback.

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "am", "be", "been", "being",
  "do", "does", "did", "doing", "to", "of", "in", "on", "at", "for", "with",
  "about", "as", "by", "and", "or", "but", "if", "so", "than", "then",
  "that", "this", "these", "those", "it", "its", "i", "you", "your",
  "we", "us", "our", "they", "them", "their", "he", "she", "his", "her",
  "me", "my", "can", "could", "would", "should", "will", "shall", "may",
  "might", "have", "has", "had", "not", "no", "yes", "please", "just",
  "up", "down", "out", "into", "over", "again", "there", "here", "how",
  "what", "when", "which", "who", "whom", "why",
  // Generic conversational filler verbs — these carry no topic-specific
  // meaning on their own (e.g. "tell me about X" / "give me info on X"),
  // but if left un-stripped they can accidentally match patterns like
  // "tell me about the company" and outscore the real answer.
  "tell", "show", "give", "get", "know", "want", "need", "explain",
  "describe", "let", "lets", "kindly", "find", "provide", "offer", "offers"
]);

// Brand words that appear in almost every message about this bot — treat
// them like filler UNLESS they're the only signal in the message (handled
// in scoreIntent's fallback logic, not by stripping them globally).
const BRAND_WORDS = new Set(["cyberdude", "cyber", "dude", "networks", "cd-bot", "cdbot", "bot"]);

/**
 * A tiny custom stemmer — not a library. Strips common suffixes, but only
 * when the resulting stem is long enough, so short unrelated words like
 * "fix" and "fixed" don't collapse into the same token incorrectly.
 */
function stem(word) {
  if (word.length <= 4) return word; // too short to safely stem
  const suffixes = ["ing", "edly", "ies", "ed", "es", "s"];
  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length - suf.length >= 4) {
      let stemmed = word.slice(0, word.length - suf.length);
      if (suf === "ies") stemmed += "y";
      return stemmed;
    }
  }
  return word;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/'/g, "") // remove apostrophes FIRST so "don't" -> "dont", "i'm" -> "im" (matches our negation/slang tables below) — without this, punctuation stripping below turns "don't" into "don t" (two broken tokens) instead
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Casual texting shorthand -> full words. Real users (especially younger
// ones testing on a phone) type "u", "ur", "wat", "plz", "abt", "ppl" etc.
// constantly — without this expansion, none of those words match anything
// in the knowledge base at all, since patterns are written in full English.
const SLANG = {
  "u": "you", "ur": "your", "r": "are", "ru": "are you",
  "wat": "what", "watz": "what", "wats": "what is",
  "plz": "please", "pls": "please", "abt": "about", "ppl": "people",
  "bcz": "because", "bc": "because", "coz": "because", "cuz": "because",
  "gonna": "going to", "wanna": "want to", "gotta": "got to",
  "im": "i am", "ive": "i have", "youre": "you are",
  "dont": "do not", "cant": "can not", "wont": "will not", "isnt": "is not",
  "doesnt": "does not", "didnt": "did not", "thats": "that is",
  "whats": "what is", "hows": "how is", "whos": "who is",
  "wheres": "where is", "whens": "when is", "hes": "he is", "shes": "she is",
  "thx": "thanks", "insta": "instagram", "rn": "right now",
  "doc": "document", "docs": "document", "info": "information"
};

function expandSlang(words) {
  const out = [];
  for (const w of words) {
    if (Object.prototype.hasOwnProperty.call(SLANG, w)) {
      out.push(...SLANG[w].split(" "));
    } else {
      out.push(w);
    }
  }
  return out;
}

// Basic negation words. When one of these appears, the NEXT MEANINGFUL
// (non-filler) word — or two — gets dropped entirely instead of counted as
// a normal match. Filler/stopwords between the negation and the real word
// ("I don't HAVE A spec") are skipped over, not counted as the negated
// word, since real sentences almost always have a filler word or two in
// between the negation and what's actually being negated.
const NEGATIONS = new Set(["no", "not", "without", "never"]);

function tokenize(text) {
  const rawWords = expandedWords(text);

  const output = [];
  let negateBudget = 0; // how many more CONTENT words to drop due to a recent negation
  for (const w of rawWords) {
    if (NEGATIONS.has(w)) {
      negateBudget = 2; // covers negated phrases up to 2 content words long, e.g. "spec document"
      continue; // drop the negation marker itself too
    }
    if (STOPWORDS.has(w)) {
      continue; // filler word — doesn't consume the negation budget, doesn't reset it either
    }
    if (negateBudget > 0) {
      negateBudget--;
      continue; // this content word falls within the negated span — drop it
    }
    output.push(w);
  }
  return output;
}

// Words after normalize() + slang expansion, but BEFORE stopword/negation
// handling — used both by tokenize() above and, joined back into a string,
// as the text the exact-phrase bonus checks against. Without applying slang
// expansion here too, a casual message like "r u chatgpt" would never get
// credit for exactly matching the pattern "are you chatgpt", since the raw
// text technically says "r u chatgpt" — only the expanded form matches.
function expandedWords(text) {
  const normalized = normalize(text);
  if (!normalized) return [];
  return expandSlang(normalized.split(" ").filter((w) => w.length > 0));
}

function stemTokens(tokens) {
  return tokens.map(stem);
}

/**
 * Levenshtein-lite "close enough" check for typo tolerance on longer words.
 * Cheap version: same stem length +/-1 and shares a long common prefix.
 */
function isCloseMatch(a, b) {
  if (a === b) return false; // exact handled elsewhere
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length < 5 || b.length < 5) return false;
  let matches = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / len >= 0.8;
}

function scoreIntent(intent, messageStems, messageTokensRaw, rawMessage) {
  let score = 0;
  let hadRealSignal = false;
  let bestPatternCoverage = 0; // best (matched words / pattern words) ratio across this intent's patterns — used only as a tie-breaker

  // Every UNIQUE meaningful word this intent's patterns match is counted
  // ONCE, no matter how many of the intent's patterns happen to repeat
  // that same word. Without this, an intent with several overlapping
  // patterns that all share one common word (e.g. 4 different phrasings
  // that all contain "company") would silently out-score a more specific,
  // correct match elsewhere purely through repetition — that word would
  // effectively count 4x instead of once. This was a real bug: "give me a
  // contact number of company" was winning on "company" appearing 4x
  // across company_overview's patterns, even though "contact" + "number"
  // are the actually meaningful words and belong to a different intent.
  const exactMatched = new Set();
  const fuzzyMatched = new Set();

  for (const pattern of intent.patterns) {
    const patternNormalized = normalize(pattern);
    const originalWordCount = patternNormalized.split(" ").length;

    // 1. Exact multi-word phrase match anywhere in the raw message = big boost
    if (originalWordCount > 1 && rawMessage.includes(patternNormalized)) {
      score += 4;
      hadRealSignal = true;
    }

    // 2. Stemmed keyword overlap for each word in the pattern
    const patternWords = patternNormalized.split(" ").filter((w) => !STOPWORDS.has(w));
    const patternStems = stemTokens(patternWords).filter((s) => !BRAND_WORDS.has(s));

    // If a pattern originally had 3+ words but stopword-stripping leaves
    // only ONE word behind, that lone survivor is too generic/weak to
    // trust for word-overlap scoring on its own — e.g. "who built you"
    // strips down to just "built", which coincidentally shows up in tons
    // of unrelated sentences ("do you build AI tools"). Such patterns only
    // count via the exact-phrase bonus above, not bare word overlap.
    const tooWeakForWordScoring = originalWordCount >= 3 && patternStems.length === 1;
    let matchedInThisPattern = 0;

    if (!tooWeakForWordScoring) {
      for (const pStem of patternStems) {
        if (messageStems.includes(pStem)) {
          exactMatched.add(pStem);
          matchedInThisPattern += 1;
        } else {
          // 3. Close/partial (typo-tolerant) match
          for (const mStem of messageStems) {
            if (isCloseMatch(pStem, mStem)) {
              fuzzyMatched.add(pStem);
              matchedInThisPattern += 0.5;
              break;
            }
          }
        }
      }
    }

    if (patternStems.length > 0) {
      const coverage = matchedInThisPattern / patternStems.length;
      if (coverage > bestPatternCoverage) bestPatternCoverage = coverage;
    }
  }

  // A word counted as an exact match anywhere doesn't also get credited
  // as a "fuzzy" match elsewhere.
  for (const w of exactMatched) fuzzyMatched.delete(w);

  score += exactMatched.size * 1.5;
  score += fuzzyMatched.size * 0.5;
  if (exactMatched.size > 0 || fuzzyMatched.size > 0) hadRealSignal = true;

  // Priority bonus — only applies if there was already real keyword overlap,
  // so an intent can never win purely on priority with zero relevance.
  if (hadRealSignal && intent.priority) {
    score += intent.priority * 0.1;
  }

  return { score, hadRealSignal, bestPatternCoverage };
}

const CONFIDENCE_THRESHOLD = 1.4;

// Generic starter suggestions used when there's no specific intent to draw
// follow-ups from (hard fallback, empty input).
const DEFAULT_SUGGESTIONS = [
  "What services do you offer?",
  "How much do you charge?",
  "How do I contact you?"
];

// A short, curated set of top-level topics shown in the hard fallback —
// NOT every single one of the 48 intents (that would be a wall of text a
// first-time visitor won't read). Short and sweet, matching the actual
// suggestion chips a user could tap next.
const FALLBACK_TOPICS = ["services", "pricing", "projects", "team", "careers", "contact"];
function listTopics() {
  return FALLBACK_TOPICS;
}

/**
 * Main entry point. Returns { reply, suggestions } for a given user message.
 * `suggestions` is always an array (possibly empty) of follow-up questions
 * the frontend renders as clickable chips under the bot's message.
 */
function getReply(message, knowledgeBase) {
  if (!message || !message.trim()) {
    return { reply: "I didn't catch that — could you type your question?", suggestions: DEFAULT_SUGGESTIONS };
  }

  const rawMessage = expandedWords(message).join(" ");
  const tokens = tokenize(message);
  const messageStems = stemTokens(tokens);

  // Was the brand name (cyberdude/cyber dude) mentioned with basically no
  // other content? e.g. "tell me about cyberdude" / "cyberdude?"
  const nonBrandTokens = tokens.filter((t) => !BRAND_WORDS.has(stem(t)) && !BRAND_WORDS.has(t));

  let best = null;
  let bestScore = 0;
  let bestCoverage = 0;
  let anySignal = false;

  for (const intent of knowledgeBase) {
    const { score, hadRealSignal, bestPatternCoverage } = scoreIntent(intent, messageStems, tokens, rawMessage);
    if (hadRealSignal) anySignal = true;
    // Strictly better score wins outright. An (almost-)tied score is broken
    // by which intent's best single pattern was matched more *completely*
    // (fewer stray/irrelevant words in that pattern left unmatched) — this
    // stops an intent from winning purely by coincidentally sharing one
    // generic word with several of another intent's patterns.
    const isBetter =
      score > bestScore + 0.01 ||
      (score > bestScore - 0.01 && bestPatternCoverage > bestCoverage);
    if (isBetter) {
      bestScore = score;
      bestCoverage = bestPatternCoverage;
      best = intent;
    }
  }

  // Brand-only message ("cyberdude", "tell me about cyberdude") -> overview
  if (nonBrandTokens.length === 0 && tokens.length > 0) {
    const overview = knowledgeBase.find((i) => i.tag === "company_overview");
    if (overview) {
      return { reply: pick(overview.responses), suggestions: overview.suggestions || DEFAULT_SUGGESTIONS };
    }
  }

  // 1. Confident match
  if (best && bestScore >= CONFIDENCE_THRESHOLD) {
    return { reply: pick(best.responses), suggestions: best.suggestions || DEFAULT_SUGGESTIONS };
  }

  // 2. Soft fallback — some weak signal exists, answer around the closest topic
  if (best && anySignal && bestScore > 0) {
    return {
      reply: `Not sure, but closest match:\n${pick(best.responses)}`,
      suggestions: best.suggestions || DEFAULT_SUGGESTIONS
    };
  }

  // 3. Hard fallback — truly no signal. Keep it SHORT: a one-line nudge,
  // with the actual topic list handed off to clickable suggestion chips
  // rather than dumped as a wall of text.
  const topics = listTopics();
  return {
    reply: `I don't have an answer for that — here's what I can help with:`,
    suggestions: topics.map((t) => `Tell me about ${t}`)
  };
}

function pick(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = { getReply, tokenize, stem, normalize };
