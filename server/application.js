import http from "node:http";
import path from "node:path";
import { createCardsApi } from "./cards-api.js";
import { createStaticHandler } from "./static.js";
import { sendText } from "./http.js";

export function createApplicationServer({ root, userCardsFile, bundledCardsFile = path.join(root, "cards.json"), production = false }) {
  const handleApi = createCardsApi(userCardsFile, bundledCardsFile);
  const serveStatic = createStaticHandler(root, { production, userCardsFile });
  return http.createServer(async (req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      sendText(res, 400, "Invalid URL");
      return;
    }
    try {
      if (!await handleApi(req, res, pathname)) await serveStatic(req, res, pathname);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) sendText(res, 500, "Internal server error");
      else res.end();
    }
  });
}
