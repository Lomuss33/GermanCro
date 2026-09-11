import { ASSET_REV, FETCH_TIMEOUT_MS } from "../config/app.js";

export async function fetchJson(url, fallback) {
  let timeoutId = 0;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  try {
    const cacheSafeUrl = url.includes("?") ? `${url}&v=${ASSET_REV}` : `${url}?v=${ASSET_REV}`;
    if (controller) {
      timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    }
    const response = await fetch(cacheSafeUrl, {
      cache: url === "cards.user.json" ? "no-store" : "default",
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!response.ok) {
      return fallback;
    }
    return await response.json();
  } catch (error) {
    return fallback;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

export async function detectCapabilities() {
  let timeoutId = 0;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  try {
    if (controller) {
      timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    }
    const response = await fetch("./api/capabilities", {
      cache: "no-store",
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!response.ok) {
      return { persistentSave: false };
    }
    const data = await response.json();
    return {
      persistentSave: Boolean(data && data.persistentSave),
      storageFile: data && data.storageFile ? data.storageFile : null,
    };
  } catch (error) {
    return { persistentSave: false };
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}
