import { cardKey, sanitizeCard } from "../shared/card-schema.js";
import { assert, readJson } from "./shared-utils.js";

function validateDeck(label, cards) {
  assert(Array.isArray(cards), `${label} must be an array`);
  const seen = new Set();

  cards.forEach((rawCard, index) => {
    const card = sanitizeCard(rawCard);
    assert(card, `${label}[${index}] is invalid`);
    const key = cardKey(card);
    assert(!seen.has(key), `${label}[${index}] duplicates an earlier card: ${key}`);
    seen.add(key);
  });

  return seen;
}

const bundledCards = await readJson("cards.json");
const userCards = await readJson("cards.user.json");

const bundledKeys = validateDeck("cards.json", bundledCards);
const userKeys = validateDeck("cards.user.json", userCards);

for (const key of userKeys) {
  assert(!bundledKeys.has(key), `cards.user.json duplicates cards.json card: ${key}`);
}

console.log("validate:cards passed");
