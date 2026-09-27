function parseUtcOffset(value) {
  const match = /^UTC(?:(\+|-)(\d{2}):?(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  if (!match[1]) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

function formatUtcOffset(minutes, includeUtc = false) {
  const sign = minutes < 0 ? "−" : "+";
  const hours = String(Math.floor(Math.abs(minutes) / 60)).padStart(2, "0");
  const remainder = Math.abs(minutes) % 60;
  return `${includeUtc ? "UTC" : ""}${sign}${hours}${remainder ? `:${String(remainder).padStart(2, "0")}` : ""}`;
}

export function summarizeTimeZone(value) {
  if (typeof value !== "string") return value;
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length < 3) return value;
  const offsets = parts.map(parseUtcOffset);
  if (offsets.some((offset) => offset === null)) return value;
  return `${formatUtcOffset(Math.min(...offsets), true)}–${formatUtcOffset(Math.max(...offsets))}`;
}
