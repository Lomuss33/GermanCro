import { LANGUAGE_SEQUENCE } from "../config/languages.js";
import { getCardValue } from "../core/text.js";

export function getPromptLanguagesForTarget(language, swapped = false) {
  const activeIndex = LANGUAGE_SEQUENCE.indexOf(language);
  const prompts = [
    LANGUAGE_SEQUENCE[(activeIndex + 1) % LANGUAGE_SEQUENCE.length],
    LANGUAGE_SEQUENCE[(activeIndex + 2) % LANGUAGE_SEQUENCE.length],
  ];
  return swapped ? prompts.reverse() : prompts;
}

export function isCardRenderable(card, targetLanguage) {
  if (!card) return false;
  return [targetLanguage, ...getPromptLanguagesForTarget(targetLanguage)]
    .every(language => getCardValue(card, language));
}

export function filterRenderableCards(cards, targetLanguage) {
  return (Array.isArray(cards) ? cards : [])
    .filter(card => isCardRenderable(card, targetLanguage));
}

export function filterCardsBySelection(cards, { topics = null, subcategories = null, scope = "all" } = {}) {
  return (Array.isArray(cards) ? cards : []).filter(card => (
    card &&
    (topics === null || topics.has(card.topic)) &&
    (subcategories === null || subcategories.has(card.subcategory)) &&
    (card.scope === "all" || card.scope === scope)
  ));
}
