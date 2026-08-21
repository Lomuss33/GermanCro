import test from "node:test";
import assert from "node:assert/strict";

import {
  TUTORIAL_LANGUAGE_PRIORITY,
  normalizeTutorialLanguage,
  resolveTutorialLanguage,
} from "../src/onboarding/tutorial-language.js";

test("tutorial language fallback priority starts with English", () => {
  assert.deepEqual(TUTORIAL_LANGUAGE_PRIORITY, ["en", "de", "hr"]);
  assert.equal(resolveTutorialLanguage([]), "en");
  assert.equal(resolveTutorialLanguage(["fr-FR", "it-IT"]), "en");
});

test("browser preference order selects English or German", () => {
  assert.equal(resolveTutorialLanguage(["de-AT", "en-GB"]), "de");
  assert.equal(resolveTutorialLanguage(["fr-FR", "en-US", "de-DE"]), "en");
});

test("Balkan browser languages use the Croatian tutorial copy", () => {
  for (const languageTag of [
    "hr-HR",
    "bs-BA",
    "sr-Latn-RS",
    "sr-Cyrl-RS",
    "sh",
    "hbs",
    "cnr-ME",
    "sl-SI",
    "mk-MK",
    "bg-BG",
    "sq-AL",
    "ro-RO",
    "el-GR",
    "tr-TR",
  ]) {
    assert.equal(normalizeTutorialLanguage(languageTag), "hr", languageTag);
  }
});

test("unsupported or malformed tutorial language tags are ignored", () => {
  assert.equal(normalizeTutorialLanguage("fr-FR"), null);
  assert.equal(normalizeTutorialLanguage(""), null);
  assert.equal(normalizeTutorialLanguage(null), null);
});
