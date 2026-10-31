import fs from "node:fs/promises";
import { cardKey, createCardDuplicateIndex, sanitizeCard } from "../shared/card-schema.js";
import { sendJson, getRequestBody } from "./http.js";

function createIndexedDeckCache(filePath) {
  let cachedTag = "";
  let cachedCards = [];
  const keyIndex = createCardDuplicateIndex();

  async function sync() {
    if (!filePath) {
      return { cards: cachedCards, index: keyIndex };
    }
    try {
      const stats = await fs.stat(filePath);
      const nextTag = `${stats.size}:${stats.mtimeMs}`;
      if (nextTag === cachedTag) {
        return { cards: cachedCards, index: keyIndex };
      }
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      cachedCards = Array.isArray(parsed) ? parsed.map(sanitizeCard).filter(Boolean) : [];
      keyIndex.rebuild(cachedCards);
      cachedTag = nextTag;
      return { cards: cachedCards, index: keyIndex };
    } catch (error) {
      if (error.code === "ENOENT") {
        cachedTag = "ENOENT";
        cachedCards = [];
        keyIndex.rebuild([]);
        return { cards: cachedCards, index: keyIndex };
      }
      throw error;
    }
  }

  async function persistCard(card) {
    cachedCards.push(card);
    keyIndex.add(card);
    const serialized = `${JSON.stringify(cachedCards, null, 2)}\n`;
    const tempFile = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(tempFile, serialized, "utf8");
    await fs.rename(tempFile, filePath);
    try {
      const stats = await fs.stat(filePath);
      cachedTag = `${stats.size}:${stats.mtimeMs}`;
    } catch {
      cachedTag = "";
    }
  }

  return { sync, persistCard };
}

export function createCardsApi(USER_CARDS_FILE, BUNDLED_CARDS_FILE = null) {
  let pendingSave = Promise.resolve();
  const userDeckCache = createIndexedDeckCache(USER_CARDS_FILE);
  const bundledDeckCache = createIndexedDeckCache(BUNDLED_CARDS_FILE);

  function serializeSave(action) {
    const result = pendingSave.then(action);
    pendingSave = result.catch(() => {});
    return result;
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

        const saved = await serializeSave(async () => {
          const [bundledDeck, userDeck] = await Promise.all([
            bundledDeckCache.sync(),
            userDeckCache.sync(),
          ]);
          const key = cardKey(card);
          if (!key || bundledDeck.index.has(card) || userDeck.index.has(card)) {
            return false;
          }
          await userDeckCache.persistCard(card);
          return true;
        });

        if (!saved) sendJson(res, 409, { error: "Card already exists." });
        else sendJson(res, 201, { ok: true, card });
        return true;
      } catch {
        sendJson(res, 500, { error: "Could not save card." });
        return true;
      }
    }

    return false;
  }

  return handleApi;
}
