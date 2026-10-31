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

The Node server binds to `127.0.0.1` by default. `HOST` can opt into another
interface, but the persistent card API is unauthenticated and must not be exposed
to an untrusted network. Concurrent writes within one server process are serialized.

## Ownership

```text
app.js                         browser entry
index.html                     accessible page structure and stable element IDs
src/
  authoring/card-authoring.js  card authoring form, session fallback, JSON export
  bootstrap/init-app.js        startup and stateful gameplay/UI coordination
  config/                      app limits, language metadata, category presentation
  core/                        HTTP, text, randomization, bounded layout cache
  game/answer-analysis.js      pure tokenization and typing-feedback rules
  game/answer-guide-ui.js      word-grid rendering, hint reveal, terminal hit badges
  game/card-pool.js            pure category, scope and language-eligibility rules
  game/category-panel.js       topic/subcategory filter buttons and round-size controls
  game/input-controller.js     keyboard, touch, and arrow-dock input bindings
  game/typing-metrics.js       gross/accepted WPM calculation
  game/weak-cards.js           adaptive weak-card tracking and session blending
  facts/                       facts controller, idle-staged loading, localization, view renderer
  grammar/                     responsive interactive grammar reference and tables
  layout/                      text measurement, viewport controller, and responsive type profiles
  onboarding/                  welcome/tour controller, copy renderer, card anchor, geometry
  search/sites.js              dictionary/search destinations
  ui/                          DOM refs, static UI, feedback effects, install guide, flags
  styles/                      ordered CSS modules, onboarding styles, glass/neon theme
server/
  application.js               HTTP routing; injectable roots for isolated tests
  cards-api.js                 persistent-card API with stat-validated O(1) duplicate index
  static.js                    static files, gzip, conditional requests, bounded asset cache
  http.js                      response/body helpers
shared/card-schema.js          shared client/server vocabulary contract + O(1) duplicate index
tests/                         behavior, server, onboarding, static shape and build tests
scripts/                       build, validation and maintenance tools
assets/, vendor/               static images and vendored text-layout dependency
build/                         generated deployable site (ignored by Git)
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
- The facts controller owns its datasets, idle-staged loading promise and picker state. Locale access
  is injected as functions, so a language switch cannot capture a stale locale.
- The bootstrap coordinates the remaining stateful gameplay. Avoid importing it from
  feature modules: this keeps the dependency graph acyclic.
- Keep card normalization and duplicate indexing in `shared/card-schema.js`, not separate client/server copies.

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

- `ui/scroll-flag.js` partitions a static flag into 27-35 irregular tiles. Passive
  scroll events trigger short transform-only fractures, with at most six pieces
  detached at once, including overlapping temporary cutouts. Sizes range from tiny
  chips and scanlines to large slabs. Smooth, four-step and eight-step motion all
  last 720ms. Cutouts are removed and animations released after reassembly.
  There is no idle loop. The background alone uses layout/paint containment;
  content keeps native scrolling with no automatic snapping or wheel interception.
  Geometry is rebuilt only on viewport resize, not on scroll. The three language
  backgrounds stay aligned across tile boundaries.
- Panels use tinted gradients and edge lighting instead of live backdrop filters.
  Avoid animating background positions or restoring page-sized blur layers.
- `ui/visual-effects.js` immediately settles fragments when the window loses focus
  or the document is hidden. The localized Reduced effects toggle persists locally;
  system reduced motion/transparency preferences take priority. `visual-effects.css`
  contains all motion/effect overrides.
- `npm run check` runs data validation, unit tests, static module checks, static-shape
  and browser smoke tests, and production build verification.
