// A complete, non-overlapping mosaic. Tile geometry changes only on resize.
export function createFlagMosaic(width, height, random = Math.random) {
  const tiles = [];
  const rowCount = width < 600 ? 9 : 7;
  const sizes = [.07, .16, .35, .7, 1.4, 2.6, 3.8, .11, .5];
  const weights = Array.from({ length: rowCount }, (_, index) => sizes[index] * (.85 + random() * .3));
  for (let index = weights.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [weights[index], weights[other]] = [weights[other], weights[index]];
  }
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let top = 0;
  weights.forEach((weight, row) => {
    const bottom = row === rowCount - 1 ? height : Math.round(top + height * weight / total);
    const columns = width < 600 ? 3 : 5;
    const widths = Array.from({ length: columns }, () => .08 + random() ** 3 * 5);
    const rowTotal = widths.reduce((sum, value) => sum + value, 0);
    let left = 0;
    widths.forEach((value, column) => {
      const right = column === columns - 1 ? width : Math.round(left + width * value / rowTotal);
      tiles.push({ x: left, y: top, width: right - left, height: bottom - top, edge: column === 0 || column === columns - 1 });
      left = right;
    });
    top = bottom;
  });
  return tiles;
}

// Free-floating cutouts can span several mosaic cells and cross other fragments.
export function createFlagCutout(width, height, random = Math.random) {
  const kind = Math.floor(random() * 4);
  const ranges = [
    [18 + random() * 38, 8 + random() * 18], // tiny chips
    [width * (.22 + random() * .42), 7 + random() * 17], // long scanline tears
    [width * (.18 + random() * .24), height * (.1 + random() * .2)], // large slabs
    [18 + random() * 35, height * (.18 + random() * .3)], // vertical shards
  ];
  const [w, h] = ranges[kind];
  const tileWidth = Math.min(width, Math.round(w));
  const tileHeight = Math.min(height, Math.round(h));
  const fromRight = random() > .5;
  const edgeOffset = random() * Math.max(0, width * .18 - tileWidth * .1);
  return {
    x: Math.round(Math.max(0, Math.min(width - tileWidth, fromRight ? width - tileWidth - edgeOffset : edgeOffset))),
    y: Math.round(random() * (height - tileHeight)),
    width: tileWidth, height: tileHeight,
  };
}

export function flagFractureFrames(direction, intensity, random = Math.random) {
  const x = (random() < .5 ? -1 : 1) * (18 + random() * 40) * intensity;
  const y = -direction * (10 + random() * 26) * intensity;
  const tilt = (random() - .5) * 1.4;
  return [
    { transform: "none", offset: 0 },
    { transform: `translate(${x}px, ${y}px) rotate(${tilt}deg)`, offset: .19 },
    { transform: `translate(${x * .78}px, ${y * .9}px) rotate(${tilt}deg)`, offset: .45 },
    { transform: `translate(${-x * .09}px, ${-y * .12}px)`, offset: .78 },
    { transform: "none", offset: 1 },
  ];
}

export function createFlagMotion(direction, intensity, cadence = "smooth", random = Math.random) {
  const easing = cadence === "coarse" ? "steps(1, end)"
    : cadence === "stepped" ? "steps(2, end)" : "cubic-bezier(.2,.7,.25,1)";
  return {
    frames: flagFractureFrames(direction, intensity, random).map(frame => ({ ...frame, easing })),
    // All cadences last equally long: only the number of visual poses changes.
    options: { duration: 720, easing: "linear" },
  };
}

export function createScrollFlag(root) {
  if (!root) return { sync() {} };
  const active = new Map();
  let tiles = [];
  let frame = 0;
  let resizeFrame = 0;
  let lastY = window.scrollY;
  let distance = 0;
  let lastBurst = -Infinity;
  let viewportWidth = 0;
  let viewportHeight = 0;
  const allowed = () => document.documentElement.dataset.effects !== "reduced"
    && !document.hidden && document.hasFocus();

  function restore(tile) {
    tile.classList.remove("is-detached");
    tile.style.removeProperty("z-index");
    if (tile.classList.contains("flag-fragment--cutout")) tile.remove();
  }

  function settle() {
    for (const [tile, animation] of active) {
      animation.onfinish = null;
      animation.cancel();
      restore(tile);
    }
    active.clear();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    distance = 0;
    lastY = window.scrollY;
  }

  function makeTile(geometry, cutout = false) {
    const tile = document.createElement("div");
    tile.className = `flag-fragment${cutout ? " flag-fragment--cutout" : ""}`;
    tile.style.left = `${geometry.x}px`;
    tile.style.top = `${geometry.y}px`;
    // One pixel of bleed prevents hairline seams at fractional zoom levels.
    tile.style.width = `${geometry.width + 1}px`;
    tile.style.height = `${geometry.height + 1}px`;
    tile.style.backgroundPosition = `${-geometry.x}px ${-geometry.y}px`;
    return tile;
  }

  function build() {
    resizeFrame = 0;
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    if (width === viewportWidth && height === viewportHeight) return;
    viewportWidth = width;
    viewportHeight = height;
    settle();
    root.style.setProperty("--flag-width", `${width}px`);
    root.style.setProperty("--flag-height", `${height}px`);
    root.setAttribute("aria-hidden", "true");
    const fragment = document.createDocumentFragment();
    tiles = createFlagMosaic(width, height).map(geometry => {
      const tile = makeTile(geometry);
      fragment.append(tile);
      return { node: tile, edge: geometry.edge };
    });
    root.replaceChildren(fragment);
  }

  function fracture() {
    frame = 0;
    const now = performance.now();
    if (!allowed() || Math.abs(distance) < 18 || now - lastBurst < 240) return;
    const direction = Math.sign(distance);
    const intensity = Math.min(1.6, .7 + Math.abs(distance) / 400);
    distance = 0;
    const candidates = tiles.filter(tile => !active.has(tile.node));
    // Most pieces come from the exposed edges, away from reading content.
    const scored = candidates.map(tile => ({ ...tile, rank: Math.random() + (tile.edge ? .65 : 0) }));
    scored.sort((a, b) => b.rank - a.rank);
    const count = Math.min(6 - active.size, 3 + Math.floor(Math.random() * 2));
    if (count <= 0) return;
    lastBurst = now;
    const chosen = scored.slice(0, Math.min(2, count)).map(tile => tile.node);
    while (chosen.length < count) {
      const tile = makeTile(createFlagCutout(viewportWidth, viewportHeight), true);
      root.append(tile);
      chosen.push(tile);
    }
    chosen.forEach((node, index) => {
      node.classList.add("is-detached");
      node.style.zIndex = String(1 + Math.floor(Math.random() * 4));
      const cadence = ["smooth", "coarse", "stepped"][(index + Math.floor(now / 720)) % 3];
      const motion = createFlagMotion(direction, intensity, cadence);
      const animation = node.animate(motion.frames, motion.options);
      active.set(node, animation);
      animation.onfinish = () => {
        restore(node);
        active.delete(node);
        // No persistent animation objects or promoted layers when reassembled.
        animation.cancel();
      };
    });
  }

  window.addEventListener("scroll", () => {
    const nextY = window.scrollY;
    const delta = nextY - lastY;
    lastY = nextY;
    if (!allowed()) { distance = 0; return; }
    if (Math.sign(delta) !== Math.sign(distance)) distance = 0;
    distance += delta;
    if (!frame) frame = requestAnimationFrame(fracture);
  }, { passive: true });
  window.addEventListener("resize", () => {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(build);
  }, { passive: true });
  build();
  return { sync() { if (!allowed()) settle(); } };
}
