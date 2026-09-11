export function getByPath(object, path) {
  return String(path || "")
    .split(".")
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);
}

export function formatTemplate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (
    params[key] !== undefined && params[key] !== null ? String(params[key]) : ""
  ));
}

export function joinLocalizedList(items, conjunction = ", ") {
  return items.filter(Boolean).join(conjunction);
}

export function getCardValue(card, language) {
  if (!card) {
    return "";
  }
  return String(card[language] || "").trim();
}

export function formatRoundTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
