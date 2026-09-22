import test from "node:test";
import assert from "node:assert/strict";
import { createFlagMosaic, flagFractureFrames } from "../src/ui/scroll-flag.js";

function randomSource(seed = 42) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test("flag fragments cover phone and desktop viewports without holes or overlap", () => {
  for (const [width, height] of [[390, 844], [1440, 900], [1920, 1080]]) {
    const tiles = createFlagMosaic(width, height, randomSource());
    assert.ok(tiles.length <= 35);
    assert.ok(new Set(tiles.map(tile => tile.width)).size > 5);
    assert.equal(tiles.reduce((area, tile) => area + tile.width * tile.height, 0), width * height);
    for (const [index, tile] of tiles.entries()) {
      assert.ok(tile.width > 0 && tile.height > 0);
      assert.ok(tile.x >= 0 && tile.x + tile.width <= width);
      assert.ok(tile.y >= 0 && tile.y + tile.height <= height);
      for (const other of tiles.slice(index + 1)) {
        const overlapX = Math.min(tile.x + tile.width, other.x + other.width) - Math.max(tile.x, other.x);
        const overlapY = Math.min(tile.y + tile.height, other.y + other.height) - Math.max(tile.y, other.y);
        assert.ok(overlapX <= 0 || overlapY <= 0);
      }
    }
  }
});

test("scroll direction reverses the fracture, and every effect returns to its exact origin", () => {
  const down = flagFractureFrames(1, 1, randomSource());
  const up = flagFractureFrames(-1, 1, randomSource());
  assert.equal(down[0].transform, "none");
  assert.equal(down.at(-1).transform, "none");
  assert.equal(up.at(-1).transform, "none");
  assert.match(down[1].transform, /, -[\d.]+px\)/);
  assert.match(up[1].transform, /, [\d.]+px\)/);
  assert.ok(down.every(frame => Object.keys(frame).every(key => ["transform", "offset"].includes(key))));
});
