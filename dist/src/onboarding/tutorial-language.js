export const TUTORIAL_LANGUAGE_PRIORITY = Object.freeze(["en", "de", "hr"]);

// The tutorial has one shared regional fallback: Croatian. Keep the visible
// learning-language choice Croatian while serving the Croatian tutorial copy
// to browsers configured for another Balkan language.
const CROATIAN_TUTORIAL_LANGUAGE_CODES = new Set([
  "hr",
  "sr",
  "bs",
  "sh",
  "hbs",
  "cnr",
  "sl",
  "mk",
  "bg",
  "sq",
  "ro",
  "el",
  "tr",
]);

export function normalizeTutorialLanguage(languageTag) {
  if (typeof languageTag !== "string") {
    return null;
  }

  const primaryCode = languageTag.trim().toLowerCase().replaceAll("_", "-").split("-")[0];
  if (primaryCode === "en" || primaryCode === "de") {
    return primaryCode;
  }
  if (CROATIAN_TUTORIAL_LANGUAGE_CODES.has(primaryCode)) {
    return "hr";
  }
  return null;
}

export function resolveTutorialLanguage(preferredLanguages = []) {
  const orderedPreferences = Array.isArray(preferredLanguages)
    ? preferredLanguages
    : [preferredLanguages];

  for (const languageTag of orderedPreferences) {
    const resolvedLanguage = normalizeTutorialLanguage(languageTag);
    if (resolvedLanguage) {
      return resolvedLanguage;
    }
  }

  return TUTORIAL_LANGUAGE_PRIORITY[0];
}
