import test from "node:test";
import assert from "node:assert/strict";
import { findPanelSnapTarget, readPageScrollY } from "../src/ui/page-scroll-assist.js";

test("panel scroll assist only corrects a near miss", () => {
  const panel = { id: "settings" };
  assert.equal(findPanelSnapTarget([{ element: panel, position: 300 }], 180, 600)?.element, panel);
  assert.equal(findPanelSnapTarget([{ element: panel, position: 300 }], 99, 600), null);
});

test("all panels use the same alignment range and the nearest panel wins", () => {
  const game = { id: "game" };
  const settings = { id: "settings" };
  const target = findPanelSnapTarget([
    { element: game, isMainCard: true, position: 250 },
    { element: settings, position: 230 },
  ], 200, 600);

  assert.equal(target?.element, settings);
  assert.equal(findPanelSnapTarget([{ element: game, isMainCard: true, position: 250 }], 49, 600), null);
});

test("panel snap follows the user's scroll direction instead of pulling backward", () => {
  const previousPanel = { id: "previous" };
  const nextPanel = { id: "next" };
  const targets = [
    { element: previousPanel, position: 300 },
    { element: nextPanel, position: 450 },
  ];

  assert.equal(findPanelSnapTarget(targets, 340, 600, 1)?.element, nextPanel);
  assert.equal(findPanelSnapTarget(targets, 340, 600, -1)?.element, previousPanel);
});

test("panel snap only corrects a close miss", () => {
  const panel = { id: "panel" };
  const targets = [{ element: panel, position: 300 }];

  assert.equal(findPanelSnapTarget(targets, 180, 600)?.element, panel);
  assert.equal(findPanelSnapTarget(targets, 179, 600), null);
});

test("page scroll position follows the browser's canonical scrolling element", () => {
  const documentElement = { scrollTop: 0 };
  const body = { scrollTop: 240 };
  const scrollingElement = { scrollTop: 120 };

  assert.equal(readPageScrollY({ scrollY: 0 }, {
    scrollingElement,
    documentElement,
    body,
  }), 120);
});

test("page scroll position falls back to body for body-rooted documents", () => {
  assert.equal(readPageScrollY({ scrollY: 0 }, {
    documentElement: { scrollTop: 0 },
    body: { scrollTop: 240 },
  }), 240);
});
