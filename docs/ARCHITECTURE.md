# Source layout and production workflow

## Commands

Use Node 24 or a current supported Node LTS release.

```sh
npm ci
npm start         # development + persistent card authoring, localhost:3000
npm run check    # data validation, unit/integration tests, module checks, build verification
npm run build    # optimized static site in build/
npm run preview  # serve build/ with compression and caching, localhost:3001
```

`PORT` overrides either server port. Static hosting still works without Node: deploy the
contents of `build/`. Static hosting cannot persist newly authored cards; the existing
session/export fallback remains available.

## Ownership

```text
app.js                     browser entry
index.html                 accessible page structure and stable element IDs
src/
  bootstrap/init-app.js    startup and stateful gameplay/UI coordination
  config/                 app limits, language metadata, category presentation
  core/                   HTTP, text, randomization, bounded layout cache
  game/answer-analysis.js  pure tokenization and typing-feedback rules
  facts/                  facts controller, data/configuration, notable people
  grammar/table.js         responsive interactive grammar tables
  layout/                 text measurement and responsive type/density profiles
  onboarding/             welcome/tour controller, geometry and tutorial language
  search/sites.js          dictionary/search destinations
  ui/                     cached DOM references and language-flag rendering
  styles/                 ordered CSS modules, onboarding styles, glass/neon theme
server/
  application.js          HTTP routing; injectable roots for isolated tests
  cards-api.js            existing persistent-card API and validation
  static.js               static files, gzip, conditional requests, bounded asset cache
  http.js                 response/body helpers
shared/card-schema.js     shared client/server vocabulary contract
tests/                    behavior, server, onboarding, static shape and build tests
scripts/                  build, validation and maintenance tools
assets/, vendor/          static images and vendored text-layout dependency
build/                    generated deployable site (ignored by Git)
```

The root JSON files stay in place deliberately: they are public fetch URLs, validator
inputs and, for `cards.user.json`, the persistent author's working data. Root CSS and
grammar/pretext JavaScript files are small compatibility entries, not duplicate sources.

`dist/` is a historical hand-maintained snapshot. It contained differences from the
development site before this refactor, so it has **not** been overwritten or deleted.
Do not mirror new edits there. New releases come from `npm run build` and `build/`.
No hosting configuration or live deployment was changed by this refactor.

## Boundaries

- `core/`, game answer analysis, and layout profiles have no application-state dependencies.
- `ui/dom.js` queries stable elements once, when the HTML module script executes.
- The facts controller owns its datasets, loading promise and picker state. Locale access
  is injected as functions, so a language switch cannot capture a stale locale.
- The bootstrap coordinates the remaining stateful gameplay. Avoid importing it from
  feature modules: this keeps the dependency graph acyclic.
- Keep card normalization in `shared/card-schema.js`, not separate client/server copies.

## CSS and visual compatibility

`src/styles/index.css` declares the exact cascade order. The numbered files retain the
original order; onboarding and the theme follow, with feature refinements and
`visual-effects.css` last. The guide-sizing file
also retains the intervening cross-panel refinements.

This extraction intentionally does **not** reorder overlapping selectors, introduce
cascade layers, or remove apparent duplicates: those changes can alter responsive
layouts and specificity. Edit the owning section, then check phone and desktop views.
The production build flattens all imports into one minified stylesheet, so source
segmentation does not add production stylesheet requests.

## Performance and verification

- `ui/scroll-flag.js` partitions a static flag into 27?35 irregular tiles. Passive
  scroll events trigger short transform-only fractures, with at most six pieces
  detached at once. All animations are released after reassembly; no idle loop.
  Geometry is rebuilt only on viewport resize, not on scroll. The three language
  backgrounds stay aligned across tile boundaries.
- Panels use tinted gradients and edge lighting instead of live backdrop filters.
  Avoid animating background positions or restoring page-sized blur layers.
- `ui/visual-effects.js` immediately settles fragments when the window loses focus
  or the document is hidden. The localized Reduced effects toggle persists locally;
  system reduced motion/transparency preferences take priority. `visual-effects.css`
  is included by both the root compatibility stylesheet and production CSS entry.
- `game/word-grid.js` retains letter nodes between keystrokes and updates changed
  feedback only. A new target resets its cache; removed overflow nodes are released.
- esbuild bundles/minifies JavaScript and CSS, produces content-hashed filenames and
  external source maps. No application framework or runtime dependency was added.
- The Node server gzips text, caches at most 16 small text assets, supports ETags/HEAD,
  and marks hashed production assets immutable. Development files revalidate;
  `cards.user.json` is never browser-cached and is served from the live source file.
- Text measurement caches use LRU limits: 256 prompt preparations, 512 grammar
  preparations and 1,024 grammar line layouts. Resize/long-session memory no longer
  grows indefinitely in these application-owned caches.
- Facts still load eagerly **outside** the critical startup promise. Scrolling still
  waits for facts geometry; dynamic panels still do not use `content-visibility: auto`.
- `npm run check` validates JSON contracts, runs behavior/server tests, checks unresolved
  module references and CSS syntax, builds the site, and verifies generated assets/data.

The refactor was browser-checked at 390, 591 and 1,440 CSS pixels: startup, hints, skips,
grammar rendering and Germany/Europe/world selection worked without horizontal overflow.
Bundle sizes measure delivered code, not a claim about a particular device's frame rate.

The original edited source files were retained locally in `.refactor-baseline/` during
extraction. This directory is ignored by Git and is not part of the production build.
