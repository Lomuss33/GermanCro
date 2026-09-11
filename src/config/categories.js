import { SUBCATEGORY_OPTIONS } from "../../shared/card-schema.js";

export const DEFAULT_SUBCATEGORIES = new Set(SUBCATEGORY_OPTIONS.filter((subcategory) => (
  subcategory !== "Ausdruck" && subcategory !== "Satz"
)));

export const SUBCATEGORY_COLORS = Object.freeze([
  "#60a5fa", "#fb923c", "#4ade80", "#f87171", "#facc15", "#a78bfa", "#22d3ee", "#f472b6",
]);

export const SUBCATEGORY_ICONS = Object.freeze({
  all: "✨",
  Nomen: "📦",
  Verb: "⚡",
  Adjektiv: "🎨",
  Adverb: "🚀",
  "Präposition": "🧭",
  "Konjunktion": "🔗",
  Ausdruck: "💬",
  Satz: "📝",
});
