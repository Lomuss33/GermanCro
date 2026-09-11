import fs from "node:fs/promises";
import path from "node:path";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { sendText } from "./http.js";

const compress = promisify(gzip);
const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".webp": "image/webp",
};
const TEXT_EXTENSIONS = new Set([".html", ".css", ".js", ".json", ".svg", ".txt"]);

export function resolveFilePath(root, pathname) {
  const target = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  const relative = path.relative(root, target);
  return relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) ? null : target;
}

export function createStaticHandler(root, { production = false, userCardsFile } = {}) {
  // Cache only small text assets, with a hard bound; mutable vocabulary bypasses it.
  const cache = new Map();
  return async function serveStatic(req, res, pathname) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      sendText(res, 405, "Method not allowed");
      return;
    }
    const filePath = pathname === "/cards.user.json" && userCardsFile
      ? userCardsFile : resolveFilePath(root, pathname);
    if (!filePath) { sendText(res, 403, "Forbidden"); return; }
    try {
      const initial = await fs.stat(filePath);
      const finalPath = initial.isDirectory() ? path.join(filePath, "index.html") : filePath;
      const stats = initial.isDirectory() ? await fs.stat(finalPath) : initial;
      const ext = path.extname(finalPath).toLowerCase();
      const mutable = path.basename(finalPath) === "cards.user.json";
      const etag = `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;
      const hashed = production && /-[A-Z0-9]{8}\.(css|js)$/.test(finalPath);
      const headers = {
        "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
        "Cache-Control": mutable ? "no-store" : hashed ? "public, max-age=31536000, immutable" : "no-cache",
        "X-Content-Type-Options": "nosniff",
        "ETag": etag,
        "Vary": "Accept-Encoding",
      };
      if (!mutable && req.headers["if-none-match"] === etag) {
        res.writeHead(304, headers); res.end(); return;
      }
      const cacheable = !mutable && TEXT_EXTENSIONS.has(ext) && stats.size <= 1024 * 1024;
      let asset = cacheable ? cache.get(finalPath) : null;
      if (!asset || asset.etag !== etag) {
        asset = { etag, data: await fs.readFile(finalPath), compressed: null };
        if (cacheable) {
          if (cache.size >= 16) cache.delete(cache.keys().next().value);
          cache.set(finalPath, asset);
        }
      }
      const acceptsGzip = (req.headers["accept-encoding"] || "").split(",").some(part => {
        const [encoding, quality] = part.trim().split(";");
        return encoding === "gzip" && (!quality || Number(quality.trim().replace(/^q=/, "")) > 0);
      });
      let data = asset.data;
      if (TEXT_EXTENSIONS.has(ext) && data.length > 1024 && acceptsGzip) {
        asset.compressed ||= await compress(data);
        data = asset.compressed;
        headers["Content-Encoding"] = "gzip";
      }
      headers["Content-Length"] = data.length;
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      sendText(res, 404, "Not found");
    }
  };
}
