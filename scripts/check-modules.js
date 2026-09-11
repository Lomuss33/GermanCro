import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "acorn";
import { analyze } from "eslint-scope";
import { transform, build } from "esbuild";
import { repoRoot } from "./shared-utils.js";

const globals = new Set([
  "window", "document", "navigator", "localStorage", "sessionStorage", "fetch", "AbortController",
  "Array", "Boolean", "Object", "String", "Number", "Math", "Map", "Set", "WeakMap", "WeakSet",
  "Promise", "Date", "JSON", "Uint32Array", "globalThis", "undefined", "requestAnimationFrame",
  "cancelAnimationFrame", "encodeURIComponent", "decodeURIComponent", "setTimeout", "clearTimeout",
  "setInterval", "clearInterval", "performance", "console", "Element", "Event", "ResizeObserver",
  "Blob", "URL", "Intl", "RegExp", "Error", "RangeError", "Infinity", "NaN", "parseFloat", "parseInt",
  "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLDialogElement", "CustomEvent", "Node", "getComputedStyle",
]);
async function walk(directory) {
  const files = [];
  for (const item of await fs.readdir(path.join(repoRoot, directory), { withFileTypes: true })) {
    const file = `${directory}/${item.name}`;
    if (item.isDirectory()) files.push(...await walk(file));
    else files.push(file);
  }
  return files;
}
const files = await walk("src");
for (const file of files) {
  const source = await fs.readFile(path.join(repoRoot, file), "utf8");
  if (file.endsWith(".js")) {
    const ast = parse(source, { ecmaVersion: "latest", sourceType: "module", ranges: true });
    const scope = analyze(ast, { ecmaVersion: 2024, sourceType: "module" });
    const unresolved = [...new Set(scope.globalScope.through.map(ref => ref.identifier.name))].filter(name => !globals.has(name));
    if (unresolved.length) throw new Error(`${file}: unresolved references: ${unresolved.join(", ")}`);
  } else if (file.endsWith(".css")) {
    const result = await transform(source, { loader: "css", logLevel: "silent" });
    if (result.warnings.length) throw new Error(`${file}: ${result.warnings.map(w => w.text).join(", ")}`);
  }
}
await build({ absWorkingDir: repoRoot, entryPoints: ["app.js", "src/styles/index.css"], outdir: "build/check", bundle: true, write: false, logLevel: "silent" });
console.log(`Module boundaries, imports and stylesheet syntax passed (${files.length} source files).`);
