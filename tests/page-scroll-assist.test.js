import test from "node:test";
import assert from "node:assert/strict";
import { findPanelSnapTarget } from "../src/ui/page-scroll-assist.js";

test("panel scroll assist only corrects a near miss", () => {
  const panel = { id: "settings" };
  assert.equal(findPanelSnapTarget([{ element: panel, position: 300 }], 180, 600)?.element, panel);
  assert.equal(findPanelSnapTarget([{ element: panel, position: 300 }], 150, 600), null);
});

test("the game card uses a tighter snap range and the nearest panel wins", () => {
  const game = { id: "game" };
  const settings = { id: "settings" };
  const target = findPanelSnapTarget([
    { element: game, isMainCard: true, position: 250 },
    { element: settings, position: 230 },
  ], 200, 600);

  assert.equal(target?.element, settings);
  assert.equal(findPanelSnapTarget([{ element: game, isMainCard: true, position: 250 }], 180, 600), null);
});
