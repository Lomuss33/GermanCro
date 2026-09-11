import fs from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { repoRoot } from "./shared-utils.js";

// A separate output directory preserves the historical, hand-edited dist snapshot.
export const outputRoot = path.join(repoRoot, "build");
const result = await build({
  absWorkingDir: repoRoot,
  entryPoints: { app: "app.js", styles: "src/styles/index.css" },
  outdir: "build/static",
  entryNames: "[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  bundle: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  sourcemap: "external",
  metafile: true,
  legalComments: "eof",
});
const entry = name => Object.entries(result.metafile.outputs).find(([, value]) => value.entryPoint === name)?.[0];
const script = entry("app.js");
const css = entry("src/styles/index.css");
if (!script || !css) throw new Error("Build did not produce both entry points");
const relative = file => path.relative(outputRoot, path.resolve(repoRoot, file)).replaceAll("\\", "/");
const html = (await fs.readFile(path.join(repoRoot, "index.html"), "utf8"))
  .replace(/\s*<link rel="stylesheet"[^>]+>/g, "")
  .replace("</head>", `<link rel="stylesheet" href="${relative(css)}">\n</head>`)
  .replace(/(<script type="module" src=")[^"]+(" ><\/script>|"><\/script>)/, `$1${relative(script)}$2`);
await fs.writeFile(path.join(outputRoot, "index.html"), html);
for (const file of ["cards.json", "cards.user.json", "locales.json", "germany-facts.json", "europe-facts.json", "world-facts.json", "logo.svg", "CNAME"]) {
  await fs.copyFile(path.join(repoRoot, file), path.join(outputRoot, file));
}
await fs.cp(path.join(repoRoot, "assets"), path.join(outputRoot, "assets"), { recursive: true });
await fs.writeFile(path.join(outputRoot, "meta.json"), JSON.stringify(result.metafile, null, 2));
for (const file of [script, css]) {
  const data = await fs.readFile(path.join(repoRoot, file));
  console.log(`${relative(file)}: ${(data.length / 1024).toFixed(1)} KiB (${(gzipSync(data).length / 1024).toFixed(1)} KiB gzip)`);
}
console.log("Production site ready in build/ (source maps included, historical dist/ unchanged).");
