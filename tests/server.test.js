import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createApplicationServer } from "../server/application.js";
import { resolveFilePath } from "../server/static.js";

test("static paths cannot escape into sibling directories", () => {
  const root=path.resolve("fixture");
  assert.equal(resolveFilePath(root,"/../fixture-other/secret"), null);
  assert.equal(resolveFilePath(root,"/"), path.join(root,"index.html"));
});

test("server supports compression, validators, HEAD, malformed URLs and persistent cards", async t => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),"germancro-test-"));
  const userCardsFile=path.join(root,"cards.user.json");
  await fs.writeFile(path.join(root,"index.html"),"<!doctype html>"+"hello ".repeat(500));
  await fs.writeFile(path.join(root,"app-ABCDEFGH.js"),"/* script */"+" ".repeat(2000));
  await fs.writeFile(userCardsFile,"[]");
  const server=createApplicationServer({root,userCardsFile,production:true});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(async()=>{
    await new Promise(resolve=>server.close(resolve));
    // Only the exact directory returned by mkdtemp is removed.
    await fs.rm(root,{recursive:true,force:true});
  });
  const base=`http://127.0.0.1:${server.address().port}`;
  const page=await fetch(base);
  assert.equal(page.status,200);
  assert.equal(page.headers.get("content-encoding"),"gzip");
  assert.match(await page.text(),/hello/);
  const cached=await fetch(base,{headers:{"if-none-match":page.headers.get("etag")}});
  assert.equal(cached.status,304);
  const head=await fetch(base,{method:"HEAD"});
  assert.equal(await head.text(),"");
  assert.equal((await fetch(`${base}/%ZZ`)).status,400);
  assert.equal((await fetch(base,{method:"POST"})).status,405);
  const asset=await fetch(`${base}/app-ABCDEFGH.js`);
  assert.match(asset.headers.get("cache-control"),/immutable/);
  await asset.text();
  const capabilities=await (await fetch(`${base}/api/capabilities`)).json();
  assert.equal(capabilities.persistentSave,true);
  const card={de:"Testhaus",hr:"test",en:"test",topic:"basics",subcategory:"Nomen",scope:"all"};
  const save=()=>fetch(`${base}/api/cards`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(card)});
  const saved=await save();
  assert.equal(saved.status,201); await saved.text();
  const duplicate=await save();
  assert.equal(duplicate.status,409); await duplicate.text();
  const cards=await fetch(`${base}/cards.user.json`);
  assert.equal(cards.headers.get("cache-control"),"no-store");
  assert.equal((await cards.json()).length,1);
});
