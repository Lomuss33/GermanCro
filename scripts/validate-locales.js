import { assert, getByPath, hasEmbeddedPlaceholder, hasSuspiciousEncoding, readJson, visitStrings } from "./shared-utils.js";

const requiredPaths = [
  "messages.actions.skip",
  "messages.actions.skipTitle",
  "messages.session.finalDetails",
  "messages.authoring.title",
  "messages.authoring.duplicate",
  "facts.tabs.world",
  "facts.fields.headquarters",
  "facts.fields.memberStates",
  "facts.fields.secretaryGeneral",
  "facts.fields.officialLanguages",
  "facts.featured.overview",
  "facts.featured.worldOverview",
  "facts.values.worldOverviewText",
  "facts.lists.notablePeople",
  "facts.lists.science",
  "facts.lists.politics",
  "facts.lists.art",
  "facts.lists.engineering",
  "onboarding.welcome.title",
  "onboarding.welcome.body",
  "onboarding.welcome.languageLabel",
  "onboarding.welcome.replayNote",
  "onboarding.languages.en",
  "onboarding.languages.de",
  "onboarding.languages.hr",
  "onboarding.progress",
  "onboarding.steps.prompts.title",
  "onboarding.steps.prompts.body",
  "onboarding.steps.input.title",
  "onboarding.steps.input.body",
  "onboarding.steps.feedback.title",
  "onboarding.steps.feedback.body",
  "onboarding.steps.settings.title",
  "onboarding.steps.settings.body",
  "onboarding.feedback.correct",
  "onboarding.feedback.next",
  "onboarding.feedback.wrong",
  "onboarding.controls.play",
  "onboarding.controls.tour",
  "onboarding.controls.back",
  "onboarding.controls.next",
  "onboarding.controls.skip",
  "onboarding.controls.start",
  "onboarding.controls.replay",
];

const locales = await readJson("locales.json");

for (const locale of ["de", "hr", "en"]) {
  const bundle = locales[locale];
  assert(bundle && typeof bundle === "object", `Missing locale bundle: ${locale}`);
  for (const dottedPath of requiredPaths) {
    const value = getByPath(bundle, dottedPath);
    assert(value !== undefined && value !== null && value !== "", `Missing ${locale}.${dottedPath}`);
  }
  visitStrings(bundle, (value, path) => {
    assert(!hasSuspiciousEncoding(value), `Suspicious encoding in locales.${locale}.${path.join(".")}`);
    assert(!hasEmbeddedPlaceholder(value), `Embedded placeholder character in locales.${locale}.${path.join(".")}`);
  });
}

console.log("validate:locales passed");
