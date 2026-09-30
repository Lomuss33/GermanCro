import fs from "node:fs/promises";
import { cardKey, sanitizeCard } from "../shared/card-schema.js";
import { sendJson, getRequestBody } from "./http.js";

export function createCardsApi(USER_CARDS_FILE) {
  let pendingSave = Promise.resolve();
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
          const cards = await readUserCards();
          if (cards.some((existing) => cardKey(existing) === cardKey(card))) return false;
          cards.push(card);
          await writeUserCards(cards);
          return true;
        });
        if (!saved) sendJson(res, 409, { error: "Card already exists." });
        else sendJson(res, 201, { ok: true, card });
        return true;
      } catch (error) {
        sendJson(res, 500, { error: "Could not save card." });
        return true;
      }
    }
  
    return false;
  }
  return handleApi;
}
