function joinSearchParts(...parts) {
  return parts.map((part) => String(part ?? "").trim()).filter(Boolean).join(" ");
}

// A fact card links to the question, never to its displayed answer.
export function factFieldSearchQuery(placeName, fieldLabel, comparisonPlace = "") {
  const place = String(placeName ?? "").trim();
  const label = String(fieldLabel ?? "").trim();
  // "EU EU member states" adds no context and makes the search look broken.
  const startsWithPlace = place && new RegExp(`^${place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[\\s-]|$)`, "iu").test(label);
  return joinSearchParts(startsWithPlace ? "" : place, label, comparisonPlace);
}

// A list chip represents a specific subject or relationship, so retain its item.
export function factListSearchQuery(placeName, listLabel, item) {
  return joinSearchParts(placeName, listLabel, item);
}
