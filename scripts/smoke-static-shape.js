import path from "node:path";

import { assert, fileExists, readText, repoRoot } from "./shared-utils.js";

function stripUrlVersion(specifier) {
  return specifier.split("?")[0].split("#")[0];
}

const html = await readText("index.html");

for (const id of [
  "heroStage",
  "mainCard",
  "gameArea",
  "answer",
  "skipCardBtn",
  "hintBtn",
  "newGameBtn",
  "factsContent",
]) {
  assert(html.includes(`id="${id}"`), `index.html is missing required id="${id}"`);
}

const scriptMatch = html.match(/<script type="module" src="([^\"]+)"><\/script>/);
assert(scriptMatch, "index.html must include a module script entry");

const entryPath = stripUrlVersion(scriptMatch[1]);
assert(await fileExists(entryPath), `Entry module does not exist: ${entryPath}`);

const visited = new Set();

async function walkModule(relativePath) {
  if (visited.has(relativePath)) {
    return;
  }
  visited.add(relativePath);
  const source = await readText(relativePath);
  const importMatches = [
    ...source.matchAll(/from \"([^\"]+)\"/g),
    ...source.matchAll(/import \"([^\"]+)\"/g),
  ];
  for (const [, specifier] of importMatches) {
    if (!specifier.startsWith(".")) {
      continue;
    }
    const cleanSpecifier = stripUrlVersion(specifier);
    const resolved = path
      .relative(repoRoot, path.resolve(path.dirname(path.join(repoRoot, relativePath)), cleanSpecifier))
      .replace(/\\/g, "/");
    assert(await fileExists(resolved), `Missing imported module ${resolved} from ${relativePath}`);
    await walkModule(resolved);
  }
}

await walkModule(entryPath);

console.log("smoke passed");
