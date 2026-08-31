import path from "node:path";

import { assert, fileExists, readText, repoRoot } from "./shared-utils.js";

function stripUrlVersion(specifier) {
  return specifier.split("?")[0].split("#")[0];
}

const html = await readText("index.html");
const distHtml = await readText("dist/index.html");
const css = await readText("style.css");
const normalizedCss = css.replace(/\r\n/g, "\n");
const onboardingCss = await readText("onboarding.css");
const normalizedOnboardingCss = onboardingCss.replace(/\r\n/g, "\n");
const appSource = await readText("src/bootstrap/init-app.js");
const tourSource = await readText("src/onboarding/first-run-tour.js");

for (const id of [
  "heroStage",
  "mainCard",
  "gameArea",
  "answer",
  "skipCardBtn",
  "hintBtn",
  "newGameBtn",
  "factsContent",
  "onboardingDialog",
  "onboardingTitle",
  "onboardingPrimaryBtn",
  "onboardingSecondaryBtn",
  "onboardingSettingsBtn",
  "tutorialReplayBtn",
]) {
  assert(html.includes(`id="${id}"`), `index.html is missing required id="${id}"`);
}

const scriptMatch = html.match(/<script type="module" src="([^\"]+)"><\/script>/);
assert(scriptMatch, "index.html must include a module script entry");
assert(html.includes('href="onboarding.css?'), "index.html must load the onboarding stylesheet");
assert(distHtml.includes('href="onboarding.css?'), "dist/index.html must load the onboarding stylesheet");

for (const { language, label, flagCode } of [
  { language: "en", label: "English", flagCode: "gb" },
  { language: "de", label: "German", flagCode: "de" },
  { language: "hr", label: "Croatian", flagCode: "hr" },
]) {
  assert(
    html.includes(`data-learning-language="${language}"`),
    `index.html is missing the ${language} learning-language option`,
  );
  assert(
    html.includes(`<span class="onboarding-language-name">${label}</span>`),
    `The ${language} learning-language option must show its full name`,
  );
  assert(
    html.includes(
      `<img class="onboarding-language-flag language-flag-icon language-flag-icon--${language}" src="https://flagcdn.com/${flagCode}.svg" alt="" decoding="async" aria-hidden="true">`,
    ),
    `The ${language} learning-language option must use the real flag image above the name`,
  );
}
for (const emoji of ["🇬🇧", "🇩🇪", "🇭🇷"]) {
  assert(!html.includes(emoji), `Onboarding must not depend on platform emoji glyph ${emoji}`);
}
assert(!html.includes("B/H/S"), "The onboarding popup must not use the B/H/S label");
assert(
  html.includes(
    '<span data-brand-segment="de">Ger</span><span data-brand-segment="en">man</span><span data-brand-segment="hr">Cro</span>',
  ),
  "The onboarding brand must expose the Ger/man/Cro language segments",
);
assert(
  html.includes('class="onboarding-replay-note-lead"') &&
    html.includes('class="onboarding-replay-note-pink"'),
  "The onboarding tip must expose separate lead-in and pink-button text styling",
);
assert(
  html.indexOf('id="sliderUnitLabel"') < html.indexOf('id="sliderLabel"') &&
    html.indexOf('id="sliderLabel"') < html.indexOf('id="sessionSizeSlider"'),
  "The rounds control must place its value between the label and slider",
);

assert(tourSource.includes("setLearningMode(nextLanguage)"), "Popup language controls must change the learning mode");
assert(tourSource.includes("syncBrandAccent(nextLanguage)"), "Popup language controls must update the matching brand accent");
assert(tourSource.includes("function renderReplayNote(note)"), "The onboarding tip must support styled localized text");
assert(tourSource.includes('finish("settings")'), "Popup settings control must close with the settings action");
assert(tourSource.includes("function advanceTour()"), "Onboarding controls must share one safe advance path");
assert(tourSource.includes('finish("played")'), "The welcome Play button must retain its mouse-click action");
for (const target of [
  'data-onboarding-target="prompt-main"',
  'data-onboarding-target="prompt-secondary"',
  'data-onboarding-target="answer-input"',
  'data-onboarding-target="answer-guide"',
  'data-onboarding-target="answer-actions"',
  'data-onboarding-target="round-settings"',
]) {
  assert(html.includes(target), `index.html is missing stable onboarding target ${target}`);
}
assert(tourSource.includes('dialog.addEventListener("keydown"'), "Onboarding keyboard handling must stay scoped to the dialog");
assert(tourSource.includes('event.key === "Escape"'), "Escape must close onboarding");
assert(
  tourSource.includes('if (event.key === "ArrowLeft")') &&
    tourSource.includes("function goToPreviousTourStep()"),
  "Tour must go back with the left arrow",
);
assert(tourSource.includes('event.key === "ArrowRight"'), "Tour must advance with the right arrow");
assert(tourSource.includes('event.key === " "'), "Tour must advance with the Space key");
assert(!tourSource.includes('document.addEventListener("keydown"'), "Onboarding must not capture document-wide key events");
assert(appSource.includes("async function loadFactsOnDemand()") && !appSource.includes("const factsPromise = Promise.all("), "Optional facts must load on demand outside critical app boot");
assert(appSource.includes("const FETCH_TIMEOUT_MS = 7000"), "Startup requests must have a bounded timeout");
assert(
  onboardingCss.includes(".onboarding-dialog:not([open])"),
  "A closed onboarding dialog must always be removed from layout",
);
assert(
  normalizedOnboardingCss.includes("pointer-events: auto"),
  "Startup language flag images must remain mouse-targetable",
);
assert(
  normalizedOnboardingCss.includes(".onboarding-brand span.is-accent"),
  "The onboarding brand must style the selected language segment",
);
assert(
  normalizedOnboardingCss.includes("grid-template-columns: repeat(3, minmax(0, 1fr));") &&
    normalizedOnboardingCss.includes(".onboarding-feedback-key > span:nth-child(2)") &&
    normalizedOnboardingCss.includes(".onboarding-feedback-key > span:nth-child(3)"),
  "The Step 3 feedback key must keep its three aligned responsive columns",
);
assert(
  normalizedOnboardingCss.includes("color: #7dd3fc;") &&
    normalizedOnboardingCss.includes("justify-content: space-between;") &&
    normalizedOnboardingCss.includes(".onboarding-language-label-letter.is-space"),
  "The onboarding language label must distribute individual letters across the full width",
);
assert(
  normalizedOnboardingCss.includes(".onboarding-dialog.is-welcome .onboarding-settings-btn"),
  "The startup settings button must have a welcome-popup layout rule",
);
assert(
  normalizedOnboardingCss.includes(".onboarding-dialog.is-welcome .onboarding-primary-btn {\n  grid-column: 2;\n  grid-row: 1 / span 2;\n  min-height: 96px;"),
  "The welcome Start learning button must be twice the base action height",
);
assert(
  normalizedOnboardingCss.includes(".onboarding-dialog.is-welcome .onboarding-settings-btn {\n  grid-column: 1;\n  grid-row: 1;\n  min-height: 72px;"),
  "The welcome Tour button must use the middle action height",
);
assert(
  normalizedOnboardingCss.includes(".onboarding-secondary-btn {\n  border: 1px solid rgba(255, 150, 184, 0.72);") &&
    normalizedOnboardingCss.includes(".onboarding-secondary-btn {\n  border: 1px solid rgba(255, 150, 184, 0.72);\n  background: linear-gradient(180deg, rgba(255, 150, 184, 0.25), rgba(255, 150, 184, 0.13));\n  color: var(--accent);"),
  "The Tour button must match the pink tutorial replay styling",
);
assert(
  normalizedOnboardingCss.includes(".onboarding-settings-btn,\n.onboarding-back-btn {\n  border: 1px solid rgba(255, 255, 255, 0.22);"),
  "The startup Settings button must keep the neutral secondary style",
);
assert(
  normalizedOnboardingCss.includes(".tutorial-replay-btn") &&
    normalizedOnboardingCss.includes("background: linear-gradient(180deg, rgba(255, 150, 184, 0.25), rgba(255, 150, 184, 0.13));") &&
    normalizedOnboardingCss.includes(".onboarding-replay-note-pink"),
  "The page Tutorial button and popup tip must share the pink treatment",
);
assert(
  appSource.includes('reason === "settings"') && appSource.includes("settingsPanel?.scrollIntoView"),
  "The startup settings control must scroll to the settings panel",
);
assert(
  appSource.includes('dataset.onboardingTarget = "category-preview"') &&
    appSource.includes("const previewRows = rows.slice(0, 3)") &&
    appSource.includes("updateOnboardingCategoryPreviewTarget"),
  "Step 4 must measure the first three responsive category rows",
);
assert(
  tourSource.includes("const minimumTargetTop") &&
    tourSource.includes("const maximumTargetBottom") &&
    tourSource.includes('behavior: "auto"'),
  "Tour steps must scroll their targets high enough to place the panel below",
);
assert(
  tourSource.includes('dialog.classList.remove("is-welcome", "is-tour")'),
  "Closing onboarding must clear its presentation mode classes",
);
assert(
  onboardingCss.includes(".onboarding-back-btn.is-hidden ~ .onboarding-primary-btn"),
  "The first tutorial step must expand its Next button when Back is hidden",
);
assert(
  tourSource.includes("const tutorialLanguage = resolveTutorialLanguage"),
  "Tutorial copy language must be resolved independently from browser preferences",
);
assert(
  !tourSource.includes("ONBOARDING_LANGUAGE_STORAGE_KEY"),
  "Tutorial copy language must not be persisted from learning-language button clicks",
);
assert(
  appSource.includes("alwaysShow: true"),
  "The launch onboarding must reopen on every browser refresh",
);
assert(
  appSource.includes("window.clearTimeout(pendingLanguageSwitchTimer);") &&
    appSource.includes("const languageSwitchToken = ++pendingLanguageSwitchToken;") &&
    appSource.includes("if (languageSwitchToken !== pendingLanguageSwitchToken) {"),
  "Learning-language switches must cancel stale delayed updates to avoid race conditions",
);
assert(
  tourSource.includes("function syncCardStartHeight()") &&
    tourSource.includes('window.addEventListener("resize", () => {') &&
    tourSource.includes("syncCardStartHeight();"),
  "The card-start onboarding height must resync on viewport changes",
);

for (const id of ["onboardingDialog", "onboardingTitle", "onboardingPrimaryBtn", "tutorialReplayBtn"]) {
  assert(distHtml.includes(`id="${id}"`), `dist/index.html is missing required id="${id}"`);
}

const distTourSource = await readText("dist/src/onboarding/first-run-tour.js");
const distAppSource = await readText("dist/src/bootstrap/init-app.js");
assert(distTourSource.includes('dialog.addEventListener("keydown"'), "dist onboarding keyboard handling is stale");
assert(distAppSource.includes("async function loadFactsOnDemand()") && !distAppSource.includes("const factsPromise = Promise.all("), "dist optional facts boot is stale");

for (const relativePath of [
  "onboarding.css",
  "src/onboarding/first-run-tour.js",
  "src/onboarding/tutorial-language.js",
  "src/onboarding/tour-geometry.js",
]) {
  const sourceAsset = await readText(relativePath);
  const distAsset = await readText(`dist/${relativePath}`);
  assert(sourceAsset === distAsset, `Production mirror is stale: dist/${relativePath}`);
}

for (const flagEntity of ["&#127469;&#127479;", "&#127468;&#127463;", "&#127465;&#127466;"]) {
  assert(!html.includes(flagEntity), `index.html still contains native flag emoji entity ${flagEntity}`);
}

for (const className of ["language-flag-icon--de", "language-flag-icon--hr", "language-flag-icon--en"]) {
  assert(normalizedCss.includes(`.${className}`), `style.css is missing .${className}`);
}
for (const [className, color] of [
  ["language-flag-icon--de", "#ffce00"],
  ["language-flag-icon--hr", "#0055ba"],
  ["language-flag-icon--en", "#c8102e"],
]) {
  assert(
    normalizedCss.includes(`.${className} {\n  border-width: 2px;\n  border-color: ${color};`),
    `style.css is missing the 2px ${color} border for .${className}`,
  );
}

assert(!appSource.includes("LANGUAGE_FLAGS"), "src/bootstrap/init-app.js must not use native flag emoji constants");
assert(
  !/\.textContent\s*=\s*LANGUAGE_FLAG/.test(appSource),
  "src/bootstrap/init-app.js must not assign language flags via textContent",
);
assert(appSource.includes("setLanguageFlagIcon("), "src/bootstrap/init-app.js must render language flags through setLanguageFlagIcon");
assert(appSource.includes("LANGUAGE_FLAG_SOURCES"), "src/bootstrap/init-app.js must define real language flag sources");
assert(appSource.includes("flagEl.src = flagSource"), "src/bootstrap/init-app.js must apply the real flag source");

const entryPath = stripUrlVersion(scriptMatch[1]);
assert(await fileExists(entryPath), `Entry module does not exist: ${entryPath}`);

const visited = new Set();

async function walkModule(relativePath) {
  if (visited.has(relativePath)) {
    return;
  }
  visited.add(relativePath);
  const source = await readText(relativePath);
  const importMatches = [
    ...source.matchAll(/from \"([^\"]+)\"/g),
    ...source.matchAll(/import \"([^\"]+)\"/g),
  ];
  for (const [, specifier] of importMatches) {
    if (!specifier.startsWith(".")) {
      continue;
    }
    const cleanSpecifier = stripUrlVersion(specifier);
    const resolved = path
      .relative(repoRoot, path.resolve(path.dirname(path.join(repoRoot, relativePath)), cleanSpecifier))
      .replace(/\\/g, "/");
    assert(await fileExists(resolved), `Missing imported module ${resolved} from ${relativePath}`);
    await walkModule(resolved);
  }
}

await walkModule(entryPath);

console.log("smoke passed");
