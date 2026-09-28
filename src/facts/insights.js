// Snapshot of memberships. Recheck against the linked official rosters when updating facts.
const EU = new Set("frankreich spanien schweden polen oesterreich ungarn kroatien griechenland bulgarien rumaenien tschechien slowakei slowenien italien niederlande belgien daenemark finnland irland portugal luxemburg".split(" "));
const EURO = new Set("frankreich spanien oesterreich kroatien griechenland bulgarien slowenien italien niederlande belgien finnland irland portugal luxemburg slowakei".split(" "));
const SCHENGEN = new Set("frankreich spanien schweden polen oesterreich ungarn kroatien griechenland bulgarien rumaenien tschechien slowakei slowenien italien niederlande belgien daenemark finnland portugal luxemburg norwegen schweiz liechtenstein".split(" "));
const NATO = new Set("frankreich spanien schweden polen ungarn kroatien griechenland bulgarien rumaenien tschechien slowakei slowenien italien niederlande belgien daenemark finnland norwegen portugal luxemburg montenegro albanien nordmazedonien tuerkei kanada usa".split(" "));

const COPY = {
  de: { density: "Bevölkerungsdichte", size: "Größe im Vergleich", roughly: "etwa", times: "× Deutschland", share: "% von Deutschland", people: "Einw./km²", context: "Einordnung", federal: "Bundesland · Deutschland", constituent: "Landesteil · Vereinigtes Königreich", eu: "EU", euro: "Eurozone", schengen: "Schengen", nato: "NATO", un: "UN" },
  en: { density: "Population density", size: "Size compared", roughly: "about", times: "× Germany", share: "% of Germany", people: "people/km²", context: "In context", federal: "Federal state · Germany", constituent: "Constituent country · United Kingdom", eu: "EU", euro: "Euro area", schengen: "Schengen", nato: "NATO", un: "UN" },
  hr: { density: "Gustoća naseljenosti", size: "Usporedba površine", roughly: "oko", times: "× Njemačka", share: "% Njemačke", people: "stan./km²", context: "Pripadnost", federal: "Savezna pokrajina · Njemačka", constituent: "Dio zemlje · Ujedinjena Kraljevina", eu: "EU", euro: "Eurozona", schengen: "Schengen", nato: "NATO", un: "UN" },
};

export function factsInsightCopy(locale) {
  return COPY[locale] || COPY.de;
}

export function parseFactNumber(value) {
  const match = String(value ?? "").match(/(\d[\d.,]*)\s*(Mio\.|Mrd\.)?/i);
  if (!match) return null;
  const raw = match[1];
  const grouped = /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(raw);
  const number = Number((grouped ? raw.replace(/\./g, "") : raw).replace(",", "."))
    * (/Mrd/i.test(match[2] || "") ? 1e9 : /Mio/i.test(match[2] || "") ? 1e6 : 1);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function createNumericalInsights(population, area, germanyArea, locale) {
  const copy = factsInsightCopy(locale);
  const people = parseFactNumber(population);
  const squareKm = parseFactNumber(area);
  const referenceArea = parseFactNumber(germanyArea);
  const formatter = new Intl.NumberFormat(locale === "hr" ? "hr-HR" : locale === "en" ? "en-GB" : "de-DE", { maximumFractionDigits: 0 });
  const insights = [];
  if (people && squareKm && people / squareKm >= 1) {
    insights.push({ label: copy.density, value: `${formatter.format(Math.round(people / squareKm))} ${copy.people}` });
  }
  if (squareKm && referenceArea && Math.abs(squareKm - referenceArea) / referenceArea > 0.005) {
    const ratio = squareKm / referenceArea;
    const languageTag = locale === "hr" ? "hr-HR" : locale === "en" ? "en-GB" : "de-DE";
    const percent = ratio * 100;
    const smallSize = percent < 0.01 ? "<0.01" : new Intl.NumberFormat(languageTag, { maximumFractionDigits: percent < 1 ? 2 : percent < 10 ? 1 : 0 }).format(percent);
    insights.push({ label: copy.size, value: ratio < 1 ? `${copy.roughly} ${smallSize} ${copy.share}` : `${copy.roughly} ${new Intl.NumberFormat(languageTag, { maximumFractionDigits: 1 }).format(ratio)} ${copy.times}` });
  }
  return insights;
}

export function getPlaceContext(kind, id, locale) {
  const copy = factsInsightCopy(locale);
  if (kind === "state") return [{ label: copy.federal }];
  if (kind === "eu" || kind === "world") return [];
  if (id === "england") return [{ label: copy.constituent }];
  if (id === "vatikanstadt") return [];
  const german = kind === "germany";
  const member = (set) => german || set.has(id);
  const badges = [{ label: copy.un, url: "https://www.un.org/about-us/member-states" }];
  if (member(EU)) badges.push({ label: copy.eu, url: "https://european-union.europa.eu/principles-countries-history/eu-countries_en" });
  if (member(EURO)) badges.push({ label: copy.euro, url: "https://european-union.europa.eu/institutions-law-budget/euro/countries-using-euro_en" });
  if (member(SCHENGEN)) badges.push({ label: copy.schengen, url: "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en" });
  if (member(NATO)) badges.push({ label: copy.nato, url: "https://www.nato.int/en/about-us/organization/nato-member-countries" });
  return badges;
}
