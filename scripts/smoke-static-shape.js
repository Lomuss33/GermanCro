import path from "node:path";

import { assert, fileExists, readText, repoRoot } from "./shared-utils.js";

function stripUrlVersion(specifier) {
  return specifier.split("?")[0].split("#")[0];
}

const html = await readText("index.html");
const distHtml = await readText("dist/index.html");
const css = await readText("style.css");
const onboardingCss = await readText("onboarding.css");
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
  "tutorialReplayBtn",
]) {
  assert(html.includes(`id="${id}"`), `index.html is missing required id="${id}"`);
}

const scriptMatch = html.match(/<script type="module" src="([^\"]+)"><\/script>/);
assert(scriptMatch, "index.html must include a module script entry");
assert(html.includes('href="onboarding.css?'), "index.html must load the onboarding stylesheet");
assert(distHtml.includes('href="onboarding.css?'), "dist/index.html must load the onboarding stylesheet");

for (const { language, label, flag } of [
  { language: "en", label: "English", flag: "🇬🇧" },
  { language: "de", label: "German", flag: "🇩🇪" },
  { language: "hr", label: "Croatian", flag: "🇭🇷" },
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
    html.includes(`<span class="onboarding-language-flag" aria-hidden="true">${flag}</span>`),
    `The ${language} learning-language option must show its flag above the name`,
  );
}
assert(!html.includes("B/H/S"), "The onboarding popup must not use the B/H/S label");
assert(
  html.indexOf('id="sliderUnitLabel"') < html.indexOf('id="sliderLabel"') &&
    html.indexOf('id="sliderLabel"') < html.indexOf('id="sessionSizeSlider"'),
  "The rounds control must place its value between the label and slider",
);

assert(tourSource.includes("setLearningMode(nextLanguage)"), "Popup language controls must change the learning mode");
assert(tourSource.includes("function advanceTour()"), "Onboarding controls must share one safe advance path");
assert(tourSource.includes('finish("played")'), "The welcome Play button must retain its mouse-click action");
assert(
  onboardingCss.includes(".onboarding-dialog:not([open])"),
  "A closed onboarding dialog must always be removed from layout",
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

for (const id of ["onboardingDialog", "onboardingTitle", "onboardingPrimaryBtn", "tutorialReplayBtn"]) {
  assert(distHtml.includes(`id="${id}"`), `dist/index.html is missing required id="${id}"`);
}

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
  assert(css.includes(`.${className}`), `style.css is missing .${className}`);
}

assert(!appSource.includes("LANGUAGE_FLAGS"), "src/bootstrap/init-app.js must not use native flag emoji constants");
assert(
  !/\.textContent\s*=\s*LANGUAGE_FLAG/.test(appSource),
  "src/bootstrap/init-app.js must not assign language flags via textContent",
);
assert(appSource.includes("setLanguageFlagIcon("), "src/bootstrap/init-app.js must render language flags through setLanguageFlagIcon");

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
