import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { repoRoot } from "../scripts/shared-utils.js";

const root=path.join(repoRoot,"build");
const html=await fs.readFile(path.join(root,"index.html"),"utf8");
const scripts=[...html.matchAll(/<script type="module" src="([^"]+)"/g)];
const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)];
assert.equal(scripts.length,1);
assert.equal(styles.length,1);
for(const [,file] of [...scripts,...styles]) {
  assert.match(file,/^static\/.+-[A-Z0-9]{8}\.(js|css)$/);
  const source=await fs.readFile(path.join(root,file),"utf8");
  assert.ok(source.length > 1000);
  if(file.endsWith(".css")) assert.doesNotMatch(source,/@import\s/);
}
for(const file of ["cards.json","cards.user.json","locales.json","germany-facts.json","europe-facts.json","world-facts.json"]) {
  assert.equal(await fs.readFile(path.join(root,file),"utf8"),await fs.readFile(path.join(repoRoot,file),"utf8"));
}
const meta=JSON.parse(await fs.readFile(path.join(root,"meta.json"),"utf8"));
const sourceBytes=Object.entries(meta.inputs).filter(([file])=>file.split("?")[0].endsWith(".js")).reduce((sum,[,info])=>sum+info.bytes,0);
const outputBytes=Object.entries(meta.outputs).filter(([file])=>file.endsWith(".js")).reduce((sum,[,info])=>sum+info.bytes,0);
assert.ok(outputBytes < sourceBytes,"Production JavaScript should be smaller than source modules");
console.log(`Build verified: one JS entry, one bundled stylesheet; JS ${(100*(1-outputBytes/sourceBytes)).toFixed(0)}% smaller than unbundled source.`);
