import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createApplicationServer } from "../server/application.js";
import { repoRoot } from "../scripts/shared-utils.js";

const run = promisify(execFile);
const candidates = process.env.CHROME_PATH ? [process.env.CHROME_PATH] : [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
let browser;
for (const candidate of candidates) {
  try {
    await fs.access(candidate);
    browser = candidate;
    break;
  } catch {
    // Try the next installed browser.
  }
}
if (!browser) {
  if (process.env.REQUIRE_BROWSER_SMOKE === "1" || process.env.CHROME_PATH) {
    throw new Error("Browser smoke test requires Chrome or Edge");
  }
  console.log("Browser smoke skipped: Chrome or Edge not installed.");
} else {
  const browserArgs = url => [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--virtual-time-budget=5000",
    "--dump-dom",
    url,
  ];
  const server = createApplicationServer({
    root: path.join(repoRoot, "build"),
    userCardsFile: path.join(repoRoot, "cards.user.json"),
    production: true,
  });
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${server.address().port}/`;
    const { stdout } = await run(browser, browserArgs(url),
      { timeout: 20000, maxBuffer: 10 * 1024 * 1024 });
    const count = stdout.match(/id="catCount"[^>]*>\s*([\d.,]+)/)?.[1];
    assert.ok(count && Number(count.replace(/\D/g, "")) > 0,
      "Production startup must load a nonempty card deck");
    assert.match(stdout, /data-topic="basics"/, "Category controls must render");
    assert.match(stdout, /data-picker-mode="(?:germany|europe|world)"/,
      "Facts controls must render");
    const factQueries = [...stdout.matchAll(/<a\b[^>]*class="[^"]*\bfacts-card-link\b[^"]*"[^>]*>/g)]
      .map(([tag]) => tag.match(/\bhref="([^"]+)"/)?.[1])
      .filter(Boolean)
      .map(href => new URL(href).searchParams.get("q"));
    assert.ok(factQueries.length > 0, "Facts cards must render with search links");
    assert.ok(factQueries.some(query =>
      /Deutschland/i.test(query) && /Größte Stadt|Largest city|Najveći grad/i.test(query) && !/Berlin/i.test(query)),
    "Largest-city search must ask about the fact without embedding its answer");
    assert.ok(factQueries.some(query =>
      /Deutschland/i.test(query) && /Zeitzone|Time zone|Vremenska zona/i.test(query) && !/MEZ|MESZ/i.test(query)),
    "Time-zone search must not embed the displayed offset or abbreviation");
    assert.ok(factQueries.some(query =>
      /Deutschland/i.test(query) && /Sprache|Language|Jezik/i.test(query) && !/\bDeutsch\b/i.test(query)),
    "Language search must not embed the displayed language");
    console.log(`Browser smoke passed: production startup loaded ${count} cards.`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  const sourceServer = createApplicationServer({
    root: repoRoot,
    userCardsFile: path.join(repoRoot, "cards.user.json"),
  });
  try {
    await new Promise(resolve => sourceServer.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${sourceServer.address().port}/tests/grammar-reference-browser.html`;
    const { stdout } = await run(browser, browserArgs(url),
      { timeout: 20000, maxBuffer: 10 * 1024 * 1024 });
    const result = stdout.match(/data-test-result="([^"]+)"/)?.[1];
    assert.equal(result, "pass", `English/Croatian grammar disclosure check: ${result || "did not finish"}`);
    console.log("Browser smoke passed: English and Croatian grammar lessons expand and close.");
  } finally {
    await new Promise(resolve => sourceServer.close(resolve));
  }
}
