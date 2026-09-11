import test from "node:test";
import assert from "node:assert/strict";
import { readText } from "../scripts/shared-utils.js";

test("scrolling panel content is not paint-contained or forced into 3D layers", async () => {
  const foundation = await readText("src/styles/01-foundation.css");
  const panels = foundation.match(/\.card,\s*\.cat-panel,[\s\S]*?\n\}/)?.[0];
  assert.ok(panels);
  assert.match(panels, /contain: none;/);
  assert.match(panels, /transform: none;/);
  assert.doesNotMatch(panels, /contain: paint|translateZ|content-visibility/);
  const theme = await readText("src/styles/theme.css");
  assert.match(theme, /body > \.facts-panel, body \.author-panel \{\s*background: transparent !important;\s*backdrop-filter: none;\s*-webkit-backdrop-filter: none;/);
  const glass = theme.match(/body #mainCard::before,[\s\S]*?\n\}/)?.[0];
  assert.ok(glass);
  assert.match(glass, /z-index: -1;/);
  assert.match(glass, /pointer-events: none;/);
  assert.match(glass, /background: var\(--reading-glass\);/);
  assert.match(glass, /backdrop-filter: blur\(14px\)/);
});

test("grammar rows and category buttons do not reserve persistent compositor layers", async () => {
  const grammar = await readText("src/grammar/table.js");
  assert.doesNotMatch(grammar, /translate3d/);
  assert.match(grammar, /translateX/);
  const styles = await readText("src/styles/04-learning-panels.css");
  assert.match(styles, /\.grammar-slider-track \{[^}]*will-change: auto;/);
  const categoryStyles = await readText("src/styles/06-responsive.css");
  assert.match(categoryStyles, /#catButtons \.cat-btn \{[^}]*will-change: auto;/);
});
