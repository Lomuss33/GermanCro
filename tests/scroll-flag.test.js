import test from "node:test";
import assert from "node:assert/strict";
import { createFlagMosaic, createFlagCutout, flagFractureFrames, createFlagMotion } from "../src/ui/scroll-flag.js";

function randomSource(seed = 42) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test("flag fragments cover phone and desktop viewports without holes or overlap", () => {
  for (const [width, height] of [[390, 844], [1440, 900], [1920, 1080]]) {
    const tiles = createFlagMosaic(width, height, randomSource());
    assert.ok(tiles.length <= 35);
    assert.ok(new Set(tiles.map(tile => tile.width)).size > 5);
    const areas = tiles.map(tile => tile.width * tile.height);
    assert.ok(Math.max(...areas) / Math.min(...areas) > 100);
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

test("cutouts include chips, scanlines and slabs and can overlap within the viewport", () => {
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const random = randomSource();
    const pieces = Array.from({ length: 80 }, () => createFlagCutout(width, height, random));
    assert.ok(pieces.some(tile => tile.width < 60 && tile.height < 30));
    assert.ok(pieces.some(tile => tile.width > width * .3 && tile.height > height * .15));
    assert.ok(pieces.some(tile => tile.width > width * .3 && tile.height < 25));
    assert.ok(pieces.some((a, index) => pieces.slice(index + 1).some(b =>
      Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x)
      && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y))));
    for (const tile of pieces) {
      assert.ok(tile.x >= 0 && tile.y >= 0);
      assert.ok(tile.x + tile.width <= width && tile.y + tile.height <= height);
    }
  }
});

test("choppy pieces use fewer poses without shortening their duration or changing their path", () => {
  const modes = ["smooth", "coarse", "stepped"].map(cadence => createFlagMotion(1, 1, cadence, randomSource()));
  assert.ok(modes.every(mode => mode.options.duration === 720));
  assert.deepEqual(modes[0].frames.map(frame => frame.transform), modes[1].frames.map(frame => frame.transform));
  assert.deepEqual(modes[0].frames.map(frame => frame.offset), modes[2].frames.map(frame => frame.offset));
  assert.equal(modes[1].frames[0].easing, "steps(1, end)");
  assert.equal(modes[2].frames[0].easing, "steps(2, end)");
  assert.ok(modes.every(mode => mode.frames.at(-1).transform === "none"));
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
