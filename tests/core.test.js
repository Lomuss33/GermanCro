import test from "node:test";
import assert from "node:assert/strict";
import { BoundedCache } from "../src/core/bounded-cache.js";
import { getByPath, formatTemplate, getCardValue, formatRoundTime } from "../src/core/text.js";
import { getSecureRandomInt, shuffle } from "../src/core/random.js";
import { getCorrectPrefixLength, getGuideTokens, getGuideWordTokens, getGuideWordTokenAt, getGuidePreviousWordToken, getFreshCorrectIndexes, getFreshWrongIndexes, isExactTypedMatch } from "../src/game/answer-analysis.js";
import { calculateWpmMetrics, countInsertedTypingUnits, countTypingUnits, formatWpm, getInsertedText } from "../src/game/typing-metrics.js";
import { computeResponsiveTypeProfile, getGameDensityProfile, getNextDenserDensity } from "../src/layout/type-profiles.js";
import { cardKey, createCardDuplicateIndex } from "../shared/card-schema.js";
import { createCardsApi } from "../server/cards-api.js";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("layout cache is bounded and retains recently used entries", () => {
  const cache = new BoundedCache(2);
  cache.set("a", 1).set("b", 2);
  assert.equal(cache.get("a"), 1);
  cache.set("c", 3);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.size, 2);
  cache.set("a", 4);
  assert.equal(cache.get("a"), 4);
  assert.equal(cache.size, 2);
  assert.throws(() => new BoundedCache(0), RangeError);
});
test("translations preserve false/zero and gracefully handle missing paths", () => {
  assert.equal(getByPath({ nested: { zero: 0 } }, "nested.zero"), 0);
  assert.equal(getByPath({}, "missing.value"), undefined);
  assert.equal(formatTemplate("{count} {missing} {flag}", { count: 0, flag: false }), "0  false");
  assert.equal(getCardValue({ de: " Haus " }, "de"), "Haus");
  assert.equal(getCardValue(null, "de"), "");
  assert.equal(formatRoundTime(125), "02:05");
});
test("answer matching preserves case-insensitivity, accents and exact length", () => {
  assert.equal(getCorrectPrefixLength("Äpfel", "äpX"), 2);
  assert.equal(isExactTypedMatch("Das Haus!", "das haus!"), true);
  assert.equal(isExactTypedMatch("Haus", "Haus "), false);
  assert.equal(isExactTypedMatch("Haus", "Hau"), false);
});
test("guide tokens retain punctuation and repeated separator positions", () => {
  const tokens = getGuideTokens(" Hallo,  Welt! ");
  assert.deepEqual(tokens.filter(t=>t.type==="separator").map(t=>t.start), [0,7,8,14]);
  const words = getGuideWordTokens(" Hallo,  Welt! ");
  assert.deepEqual(words.map(t=>t.text), ["Hallo,", "Welt!"]);
  assert.equal(getGuideWordTokenAt(words, 9).wordNumber, 2);
  assert.equal(getGuideWordTokenAt(words, 8), null);
  assert.equal(getGuidePreviousWordToken(words, 9).wordNumber, 1);
  assert.deepEqual(getGuideTokens(""), []);
});
test("typing feedback only reports newly changed positions", () => {
  assert.deepEqual([...getFreshCorrectIndexes("Haus", "Hxx", "Haus")], [1,2,3]);
  assert.deepEqual([...getFreshWrongIndexes("Haus", "Hx", "Hxy")], [2]);
  assert.deepEqual([...getFreshWrongIndexes("Haus", "Hxy", "H")], []);
});
test("typing metrics count inserted visible units and calculate standard WPM", () => {
  assert.equal(countTypingUnits("Äpfel"), 5);
  assert.equal(countTypingUnits("👍🏽"), 1);
  assert.equal(getInsertedText("Haus", "Haus!"), "!");
  assert.equal(countInsertedTypingUnits("Haus", "Haus!"), 1);
  assert.equal(countInsertedTypingUnits("abc", "axc"), 1);
  assert.equal(countInsertedTypingUnits("abcd", "acd"), 0);

  const metrics = calculateWpmMetrics({
    typedUnits: 250,
    acceptedUnits: 200,
    elapsedMs: 60000,
  });
  assert.equal(metrics.grossWpm, 50);
  assert.equal(metrics.acceptedWpm, 40);
  assert.equal(metrics.displayedWpm, 50);
  assert.equal(metrics.precision, 0.8);
  assert.match(formatWpm(42.25), /^42[.,]3$/);
  assert.equal(formatWpm(null), "—");
});
test("responsive type and density stay bounded across phone and desktop widths", () => {
  for (const [width,height] of [[320,568],[390,844],[1440,900],[2560,1440]]) {
    const profile=computeResponsiveTypeProfile({viewportWidth:width,viewportHeight:height,cardWidth:width});
    assert.ok(profile.bodyScale >= 0.82 && profile.bodyScale <= 1.35);
    assert.ok(profile.contentWidth >= 390 && profile.contentWidth <= 780);
  }
  assert.equal(getGameDensityProfile({viewportWidth:390,viewportHeight:844,cardWidth:390}), "dense");
  assert.equal(getGameDensityProfile({viewportWidth:1440,viewportHeight:900,cardWidth:880}), "regular");
  assert.equal(getNextDenserDensity("dense"), "dense");
});
test("shuffle preserves its input and random values stay in range", () => {
  const input=[1,2,3,4,5];
  assert.deepEqual(shuffle(input).sort(), input);
  assert.deepEqual(input, [1,2,3,4,5]);
  for(let i=0;i<100;i++) assert.ok(getSecureRandomInt(7) >= 0 && getSecureRandomInt(7) < 7);
  assert.equal(getSecureRandomInt(0), 0);
});
test("duplicate card index performs O(1) NFC-normalized and punctuation-insensitive checks", () => {
  const baseCard = {
    de: "die Übung".normalize("NFD"),
    hr: "vježba".normalize("NFD"),
    en: "exercise",
    topic: "basics",
    subcategory: "Nomen",
    scope: "all",
  };
  const index = createCardDuplicateIndex([baseCard]);
  assert.equal(index.size, 1);
  assert.equal(index.has({
    de: "  DIE ÜBUNG! ",
    hr: "VJEŽBA.",
    en: "workout",
    topic: "basics",
    subcategory: "Nomen",
    scope: "shared",
  }), true);
  assert.equal(cardKey(baseCard), cardKey(baseCard));
});
test("cards API blocks bundled and user duplicates in O(1) and writes atomically", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "germancro-api-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const bundledFile = path.join(dir, "cards.json");
  const userFile = path.join(dir, "cards.user.json");
  const bundledCard = { de: "das Auto", hr: "auto", en: "car", topic: "vehicles", subcategory: "Nomen", scope: "all" };
  await fs.writeFile(bundledFile, JSON.stringify([bundledCard]), "utf8");
  await fs.writeFile(userFile, "[]", "utf8");
  const handleApi = createCardsApi(userFile, bundledFile);

  const post = async (payload) => {
    const req = Readable.from([JSON.stringify(payload)]);
    req.method = "POST";
    let status = 0;
    let body = "";
    const res = {
      writeHead(code) { status = code; },
      end(chunk = "") { body = chunk; },
    };
    await handleApi(req, res, "/api/cards");
    return { status, body: JSON.parse(body) };
  };

  assert.equal((await post(bundledCard)).status, 409);
  const newCard = { de: "der Zug", hr: "vlak", en: "train", topic: "vehicles", subcategory: "Nomen", scope: "all" };
  assert.equal((await post(newCard)).status, 201);
  assert.equal((await post(newCard)).status, 409);
});
