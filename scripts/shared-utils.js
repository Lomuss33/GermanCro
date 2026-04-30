import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function readText(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  return fs.readFile(filePath, "utf8");
}

export async function fileExists(relativePath) {
  try {
    await fs.access(path.join(repoRoot, relativePath));
    return true;
  } catch (error) {
    return false;
  }
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function getByPath(target, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => (value && key in value ? value[key] : undefined), target);
}

export function visitStrings(node, visitor, path = []) {
  if (typeof node === "string") {
    visitor(node, path);
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((value, index) => visitStrings(value, visitor, [...path, String(index)]));
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  Object.entries(node).forEach(([key, value]) => {
    visitStrings(value, visitor, [...path, key]);
  });
}

export function hasSuspiciousEncoding(value) {
  return /[ÃÂâðÅÆ]/.test(value);
}

export function hasEmbeddedPlaceholder(value) {
  return /\b\S*\?\S*\b/.test(value);
}
