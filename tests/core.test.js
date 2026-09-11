import test from "node:test";
import assert from "node:assert/strict";
import { BoundedCache } from "../src/core/bounded-cache.js";
import { getByPath, formatTemplate, getCardValue, formatRoundTime } from "../src/core/text.js";
import { getSecureRandomInt, shuffle } from "../src/core/random.js";
import { getCorrectPrefixLength, getGuideTokens, getGuideWordTokens, getGuideWordTokenAt, getGuidePreviousWordToken, getFreshCorrectIndexes, getFreshWrongIndexes, isExactTypedMatch } from "../src/game/answer-analysis.js";
import { computeResponsiveTypeProfile, getGameDensityProfile, getNextDenserDensity } from "../src/layout/type-profiles.js";

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
