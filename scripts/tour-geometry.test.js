import test from "node:test";
import assert from "node:assert/strict";

import { expandRect, getUnionRect, placeTourPanel } from "../src/onboarding/tour-geometry.js";

test("getUnionRect combines multiple highlighted regions", () => {
  assert.deepEqual(
    getUnionRect([
      { left: 20, top: 40, right: 220, bottom: 90 },
      { left: 30, top: 100, right: 240, bottom: 150 },
    ]),
    { left: 20, top: 40, right: 240, bottom: 150, width: 220, height: 110 },
  );
});

test("expandRect respects viewport edges", () => {
  assert.deepEqual(
    expandRect(
      { left: 3, top: 4, right: 397, bottom: 196 },
      { padding: 10, edge: 6, viewportWidth: 400, viewportHeight: 800 },
    ),
    { left: 6, top: 6, right: 394, bottom: 206, width: 388, height: 200 },
  );
});

test("desktop panel prefers available space below the spotlight", () => {
  const placement = placeTourPanel({
    spotlight: { left: 300, top: 80, right: 700, bottom: 180, width: 400, height: 100 },
    panelWidth: 400,
    panelHeight: 180,
    viewportWidth: 1000,
    viewportHeight: 800,
  });
  assert.equal(placement.placement, "below");
  assert.equal(placement.top, 196);
});

test("mobile panel moves to the top when the target occupies the bottom", () => {
  const placement = placeTourPanel({
    spotlight: { left: 10, top: 610, right: 380, bottom: 730, width: 370, height: 120 },
    panelWidth: 366,
    panelHeight: 210,
    viewportWidth: 390,
    viewportHeight: 844,
    isPhone: true,
  });
  assert.equal(placement.placement, "top-sheet");
  assert.equal(placement.top, 12);
});
