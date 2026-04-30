import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cardKey, sanitizeCard } from "./shared/card-schema.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const USER_CARDS_FILE = path.join(ROOT, "cards.user.json");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

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
    const headers = {
      "Content-Type": type,
    };

    if ([".html", ".css", ".js", ".json", ".svg", ".txt"].includes(ext)) {
      headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
      headers.Pragma = "no-cache";
      headers.Expires = "0";
    }

    res.writeHead(200, headers);
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
