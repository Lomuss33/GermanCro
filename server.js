const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const USER_CARDS_FILE = path.join(ROOT, "cards.user.json");

const SUBCATEGORY_ALIASES = {
  Praeposition: "Präposition",
  "PrÃ¤position": "Präposition",
  "PrÃƒÂ¤position": "Präposition",
};

const VALID_TOPICS = new Set([
  "basics",
  "vehicles",
  "nature",
  "food",
  "travel",
  "work",
  "health",
  "people",
  "shopping",
  "developertech",
  "itnetwork",
  "deutschebahn",
  "bahn-technik",
]);

const VALID_SUBCATEGORIES = new Set([
  "Nomen",
  "Verb",
  "Adjektiv",
  "Adverb",
  "Präposition",
  "Konjunktion",
  "Ausdruck",
  "Satz",
]);
const VALID_SCOPES = new Set(["all", "de", "hr", "gb"]);

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function normalizeTopic(topic) {
  return String(topic || "").trim().toLowerCase();
}

function normalizeSubcategory(subcategory) {
  return SUBCATEGORY_ALIASES[subcategory] || subcategory;
}

function normalizeScope(scope) {
  const normalized = String(scope || "").trim().toLowerCase();
  if (!normalized || normalized === "shared" || normalized === "universal") {
    return "all";
  }
  if (normalized === "en") {
    return "gb";
  }
  return normalized;
}

function normalizeField(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeAnswer(value) {
  return normalizeField(value).replace(/[.,!?:;]+$/, "").toLowerCase();
}

function cardKey(card) {
  return [
    normalizeAnswer(card.de),
    normalizeAnswer(card.hr),
    normalizeTopic(card.topic),
    normalizeSubcategory(card.subcategory),
    normalizeScope(card.scope),
  ].join("::");
}

function sanitizeCard(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const card = {
    de: normalizeField(raw.de),
    hr: normalizeField(raw.hr),
    en: normalizeField(raw.en),
    topic: normalizeTopic(normalizeField(raw.topic)),
    subcategory: normalizeSubcategory(normalizeField(raw.subcategory || raw.cat)),
    scope: normalizeScope(normalizeField(raw.scope || "all")),
  };

  if (
    !card.de ||
    !card.hr ||
    !card.en ||
    !VALID_TOPICS.has(card.topic) ||
    !VALID_SUBCATEGORIES.has(card.subcategory) ||
    !VALID_SCOPES.has(card.scope)
  ) {
    return null;
  }

  return card;
}

async function readUserCards() {
  try {
    const raw = await fs.readFile(USER_CARDS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(sanitizeCard).filter(Boolean) : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeUserCards(cards) {
  await fs.writeFile(USER_CARDS_FILE, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/capabilities" && req.method === "GET") {
    sendJson(res, 200, {
      persistentSave: true,
      storageFile: "cards.user.json",
    });
    return true;
  }

  if (pathname === "/api/cards" && req.method === "POST") {
    try {
      const body = await getRequestBody(req);
      const parsed = JSON.parse(body);
      const card = sanitizeCard(parsed);

      if (!card) {
        sendJson(res, 400, { error: "Invalid card payload." });
        return true;
      }

      const cards = await readUserCards();
      if (cards.some((existing) => cardKey(existing) === cardKey(card))) {
        sendJson(res, 409, { error: "Card already exists." });
        return true;
      }

      cards.push(card);
      await writeUserCards(cards);
      sendJson(res, 201, { ok: true, card });
      return true;
    } catch (error) {
      sendJson(res, 500, { error: "Could not save card." });
      return true;
    }
  }

  return false;
}

function resolveFilePath(pathname) {
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(path.join(ROOT, relativePath));
  if (!normalized.startsWith(ROOT)) {
    return null;
  }
  return normalized;
}

async function serveStatic(res, pathname) {
  const filePath = resolveFilePath(pathname);
  if (!filePath) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    const finalPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const data = await fs.readFile(finalPath);
    const ext = path.extname(finalPath).toLowerCase();
    const type = CONTENT_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  } catch (error) {
    sendText(res, 404, "Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (await handleApi(req, res, pathname)) {
    return;
  }

  await serveStatic(res, pathname);
});

server.listen(PORT, () => {
  console.log(`GermanCro local server running at http://localhost:${PORT}`);
});
