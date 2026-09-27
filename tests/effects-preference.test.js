import test from "node:test";
import assert from "node:assert/strict";
import { prefersReducedEffects } from "../src/ui/effects-preference.js";
import { initVisualEffects } from "../src/ui/visual-effects.js";

test("manual effects setting and system motion preference both reduce motion", () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  try {
    let systemReduced = false;
    globalThis.window = {
      matchMedia: () => ({ matches: systemReduced }),
    };
    globalThis.document = { documentElement: { dataset: { effects: "full" } } };

    assert.equal(prefersReducedEffects(), false);
    globalThis.document.documentElement.dataset.effects = "reduced";
    assert.equal(prefersReducedEffects(), true);
    globalThis.document.documentElement.dataset.effects = "full";
    systemReduced = true;
    assert.equal(prefersReducedEffects(), true);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});

test("transparency preference does not force the motion toggle off", () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousStorage = globalThis.localStorage;
  try {
    const listeners = new Map();
    const attributes = new Map();
    const titleEl = { textContent: "" };
    const button = {
      disabled: false,
      querySelector: () => titleEl,
      addEventListener: (name, listener) => listeners.set(name, listener),
      setAttribute: (name, value) => attributes.set(name, value),
    };
    globalThis.window = {
      matchMedia: (query) => ({ matches: query.includes("transparency"), addEventListener() {} }),
      addEventListener() {},
    };
    globalThis.document = {
      documentElement: { dataset: {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
    };
    globalThis.localStorage = { getItem: () => null, setItem() {} };

    initVisualEffects({ button, getLanguage: () => "en" });
    assert.equal(document.documentElement.dataset.effects, "full");
    assert.equal(document.documentElement.dataset.transparency, "reduced");
    assert.equal(button.disabled, false);
    listeners.get("click")();
    assert.equal(document.documentElement.dataset.effects, "reduced");
    assert.equal(attributes.get("aria-pressed"), "true");
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    globalThis.localStorage = previousStorage;
  }
});
