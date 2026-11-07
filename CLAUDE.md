# Pacsaz

A packaging **dieline** platform. A dieline is the flat 2D drawing a box is cut and
folded from. Dielines are **parametric**: every template is authored once with
expressions over `width`, `length`, `height` and material `thickness`, and is
regenerated for any size a customer asks for.

Turborepo + pnpm monorepo. Two Next.js 16 apps (React 19, App Router) share the
packages below.

| Path | What it is |
| --- | --- |
| `apps/client` | Public site (Persian, RTL): catalogue, dieline customisation, payments, user panel. Port 3000. |
| `apps/admin` | Staff panel (English UI): dieline authoring **editor**, catalogue, tariffs, customers. Port 3001. |
| `packages/dieline-engine` | **Editor v2 geometry engine** (pure TypeScript). See below. |
| `packages/editor` | **Editor v2 UI**: `Studio` (the whole editor), `EditorStore`, the interactive `Canvas`, panels. |
| `packages/dieline-core` | Legacy engine (makerjs + Redux-coupled). Being replaced by `dieline-engine`; do not extend it. |
| `packages/dieline-3d` | Fold rig and three.js 3D preview built from the 2D dieline. |
| `packages/store` | Redux Toolkit store for the legacy editor (`redux-undo`). |
| `packages/ui` | shadcn-style UI kit (Radix / Base UI, Tailwind 4). |
| `packages/db` | Prisma 7 + PostgreSQL. |
| `packages/auth`, `packages/lib` | Auth.js v5 helpers, shared constants. |

## Commands

```bash
pnpm install
pnpm dev                                        # both apps
pnpm check-types                                # whole repo
pnpm --filter @repo/dieline-engine test         # engine tests (vitest)
pnpm --filter @repo/dieline-engine check-types
pnpm --filter @repo/editor test                 # editor model tests (vitest)
```

Canvas playground (development only, no login, no database):
`http://localhost:3001/dev/editor`. The store is on `window.__editor` there.

## Editor v2 redesign (in progress, branch `editor-v2`)

The project has never been deployed. Old dielines and the old spec format are
**not** preserved — change anything, especially in the core.

The goal is one editor shared by both apps, in two modes:

- **Studio** (admin): full parametric authoring — expressions, variables, rules,
  references, components.
- **Customize** (paid users): edits a private copy of a template; only parameters
  and nodes the designer exposed are editable, plus safe actions (windows, holes,
  flap styles, corner rounding).

Phases (each ends with a commit message for the user to commit):

1. **Core v2** — `packages/dieline-engine`: spec format, restricted expressions,
   pure renderer, per-node diagnostics, anchors and references, components, SVG/DXF export.
2. **Interactive canvas** — shared package; selection, hover, handles, snapping,
   measure, live edits. Drag edits the constant term of an expression; snapping
   writes a reference; Alt writes a plain number.
3. **Studio shell** — top bar, tool rail, outline, inspector with effect stack,
   expression editor (autocomplete, evaluated value, inline errors), command palette, shortcuts.
4. **Panels and edge features** — panel-chain tool; tuck / dust / glue flaps, lock
   tabs, slots, notches attached to edges. Built as components in the spec format.
5. **Packaging intelligence** — line types, bridges (nicks), design checks
   (double knives, open contours, ...), min/max ghost overlay, docked 3D.
6. **Customize mode** — exposed params, locked nodes, paywall, server re-validation.
7. **Library and templates** — RTE, STE, crash-lock, FEFCO 0201 / 0427, trays.

## `@repo/dieline-engine` rules

- **Pure.** No React, no Redux, no DOM, no globals. `render(doc, inputs)` in,
  `RenderResult` out. Anything that needs the store belongs in the app.
- **Never throw out of `render`.** Every failure becomes a `Diagnostic` attached to
  the node and field that caused it (`field` is a dotted path such as
  `segments.2.dx`), and the rest of the dieline still renders.
- **Coordinates:** millimetres, Y up, angles in degrees, arcs counter-clockwise from
  `start` to `end`. Renderers flip Y for the screen.
- **Geometry** is a flat list of `line` / `arc` / `circle` primitives, each tagged
  with `nodeId` and `lineType`. makerjs is used only where it earns its place
  (booleans, offset/outline, DXF export) — convert in `geometry/makerjs.ts`.
- **Expressions** go through `expr/` only: a restricted mathjs instance (no
  `import`, `evaluate`, `parse`, `createUnit`, ...), compiled once and cached.
  References use `@nodeName.anchor.x`, `@nodeName.width`.
- Node `name` is the reference identifier (unique, `[A-Za-z_][A-Za-z0-9_]*`);
  `label` is for display. Renaming a node must rewrite references (editor job).
- Spec changes go through `spec/types.ts` **and** `spec/schema.ts` together, with
  tests.

### Where things stand

- Phases 1–6 are done. The admin route `/editor/[slug]` is the v2 `Studio`
  (`apps/admin/app/editor/[slug]/StudioEditor.tsx`); the old admin editor was removed.
- v2 documents are stored in `Dieline.specification` as JSON with `"version": 2`,
  validated by `parseDocument` in the `saveDielineDocument` server action.
  Specifications in the old format open as an empty document.
- The client app renders with the engine (`useEngineDieline` in
  `apps/client/components/product/`); templates still in the old format show an
  "being updated" notice. `dieline-core` is only used there for material data and
  the old dimension helpers of the settings panel; the Redux store still holds
  the size settings.

### Box bodies and the component library

- A `panels` node is a carton body: panels side by side (`name`, `width`), all
  `height` tall, folds between them, and an optional **edge feature** on each
  panel's top/bottom and on the outer left/right edges. Free edges are cut; an
  edge with a feature draws its hinge (the component's `edge.hinge`, overridable).
- Edge features are components drawn in the **edge frame**: hinge from (0, 0) to
  (edge, 0), feature towards +y; `edge` is in scope inside them. The body maps
  that frame onto the real edge (top: as is; bottom: rotated 180°; left: 90°;
  right: −90°), and `flip` mirrors it end to end.
- A panel's `inset` (`left`/`right`) pulls its top and bottom edges in, both
  ends alike; different values slope the edge (no part allowed there). Folds run
  between the shorter edges; outer side edges keep their frame on the body's
  corners and get `startInset`/`endInset`. The keyboard box's inner walls are half
  a board shorter, the strip over each double wall slopes up to the outer wall.
- The keyboard box (`lib:keyboardLid`, `lib:keyboardFront`, `lib:keyboardTabs`,
  preset `keyboardBox`) is measured from a real die (an earlier `Sample.pdf`,
  315 × 202 × 62 on 3 mm board): board-following lengths are in
  `thickness`, shapes in the height, so at 3 mm it matches that die within
  0.3 mm. Reliefs where flaps fold side by side are half circles of radius
  thickness / 2 touching the flap's fold. Two deliberate differences: the
  front base fold stops at its reliefs instead of running under 1 mm of cut,
  and the base's side folds stop along the slots (a cut on a crease is a
  double knife).
- Panels expose dotted anchors and scalars: `@body.front.topLeft.x`,
  `@body.front.width`, plus `bodyWidth`/`bodyHeight`. `lookupRef` reads a path as
  "everything before a trailing x/y is the point name".
- Built-in components live in `dieline-engine/src/library/components.ts`, written
  in the spec format (`lib:tuckLid`, `lib:dustFlap`, `lib:glueFlap`,
  `lib:slottedFlap`, `lib:plainFlap`, `lib:thumbNotch`, and the snap lock bottom:
  `lib:snapLockNotched`, `lib:snapLockTab`, `lib:snapLockSide`; the auto-lock bottom:
  `lib:autoLockMain`, `lib:autoLockSide`. Lock flaps share one round hole centred
  on each panel fold; `edge.relief` makes the body stop that fold at the hole. The
  body's Bottom setting (`bottomFeatures`) sets all four bottom edges at once). Size params default to 0
  meaning "auto" and are resolved in the component's variables. A document
  component with the same id shadows a built-in one.
- Presets (`library/presets.ts`): reverse tuck end, straight tuck end, sleeve,
  FEFCO 0201. The FEFCO 0201 is measured from a real B-flute die (`Sample.pdf`
  in the repo root, 400 × 300 × 300 on 3 mm board) and `panels.test.ts` pins it:
  body as tall as the side creases (`height - thickness - 1`), front/back flap
  creases one board further out (`lib:slottedFlap` `raised`), all tips on one
  line, slots 2 × thickness ending in a half circle centred on the fold, the
  free-end panel 1 mm short, a 30–50 mm joint (45 at 300 high) with 15° tapers.
  Bodies run front, side, back, side, glue; front and back are
  `max(length, width)` and the sides `min(...)`, so lids always sit on the wide
  panels and dust flaps on the narrow ones. Tuck lids hinge one board thickness above the body edge and are exactly the box across the opening fold to fold (so closed, the tuck fold lands on the far wall); they carry friction-lock slits (rounding into a short hook past the tuck fold, which sits one thickness below the lid edge) along
  the tuck fold (a slit that runs on as a fold is not an open cut; `closedLoops`
  drops slits); dust flaps are nearly square on the lid side with a chamfer and
  slope on the other. Glue areas export and draw with fine dark hatching rising to the right (`GLUE_HATCH`), no outline.
  Edge features get `startFree`/`endFree` (1 when the neighbouring panel's
  same edge is a plain cut) and `startNext`/`endNext` (1 when it carries a
  feature). A dust flap's far side steps back one thickness from the fold
  beside a plain edge, straight up; its relief notch is cut only beside a lid.
  Every such allowance is one board `thickness` (minimum 0.3 mm): the raised
  lid hinge, the tuck fold's step, the tuck's side clearance, the hook past
  the fold, the dust flap set-back; the relief notch is as wide as the board (radius thickness / 2), at least 0.5 mm. The glue flap runs the full panel height, its ends on the body edges. The 3D board is textured: paper grain, or kraft with flutes. Folds stop at windows: `render` trims any fold inside a hole (`trimFoldsAtHoles`) and reports the length as `foldsCut`; a customer change that cuts more fold than the template is rejected by `verifyCustomization`. The 3D fold SVG still gets the whole fold (`foldsInHoles`) plus `window` outlines; the rig drops faces inside a window (`extractWindows` → `buildFoldRig(segments, config, windows)`). New presets must render without diagnostics and keep the cut
  outline closed at several sizes (see `panels.test.ts`).

- The gable handle carton is measured from a Pacdora sample die (302 × 152 × 182):
  roof and handle flap each half the box deep, gusset sides at about 52° with a
  generously rounded tip, a 45 mm glue flap, straight side lock tabs, and a grip
  flap (`lib:gableRoof` `grip`) folding in on a crease in the back handle's slot.
  Closed (the owner's description): the roofs fold flat 90° in and meet in the
  middle, the handle flaps fold 90° out to stand back to back, and the gussets
  lean in like a cone (`GABLE_GUSSET_LEAN`, ≈ 30°) until the top of each slit
  catches the notch under the handles' ears. Ear, peak and slit are ratios of
  the depth, so the lean holds at every size; the seed stores these folds.
  Authored fold angles are used exactly (`RigNode.authored`): the schedule only
  tucks an untouched square flap 6° past.
- Starter templates are in `packages/db/src/seed/templates.ts`
  (`pnpm --filter @repo/db seed:templates`, `-- --check` to only validate). Every
  corner of a template's size range must render clean on every material, or it is
  not saved. A dieline may hold separate pieces (tray and sleeve): the fold rig
  roots a tree in each.

### Packaging checks, nicks, 3D

- `checkDieline(result)` (`dieline-engine/src/checks/checks.ts`) finds gaps and
  open cut ends, double knives, crossing lines, folds that end in the board and
  tiny segments, on the rendered geometry. **Every preset must pass it with no
  issues** (`checks.test.ts`); it already caught dust flaps running down the
  lid's cut line.
- `addNicks(paths, { width, spacing })` splits cut lines for bridges; `toSVG` /
  `toDXF` take `nicks` too. DXF never holds bleed; each layer has its ACI
  colour (`DXF_LAYER_COLORS`) and GLUE is written first so cut and crease draw
  over it. `toFoldSVG(result)` writes the `trim`/`fold`/`perf`
  SVG that `@repo/dieline-3d` folds.
- In the Studio, `useAnalysis()` (`editor/src/state/analysis.ts`) renders the
  template at `sizeRange.min/max` (ghosts) and runs the checks at all three
  sizes, cached per render. The admin passes each dieline's min/max dimensions.
- Polygons can be sized by side (`sizeBy: "side"`); the Triangle tool draws
  three-sided polygons that way.
- Bleed (`geometry/bleed.ts`) is the outermost closed cut loop offset outward
  with round corners, after narrow notches (gaps up to `bridgeGap`: 10 mm, or 3 × bleed) are closed across their mouth so no hairline runs down a slot (any notch at least half the bleed deep; each bridge then slides on to the curve's tangent and the next outer corner, so a handle's ear bleeds as one straight line to the top); it does not use makerjs (too slow, and wrong on narrow
  notches). `export.test.ts` checks it on every preset at several distances.

### 3D folding

- The fold animation is staged (`dieline-3d/src/schedule.ts`): the glue flap,
  then the body panels one by one (the far end closes onto the glue last), then
  the bottom flaps, then the top flaps. On each side: dust flaps, then flaps on
  flaps (the tuck bends while its lid is open), then the lid. A side with no lid
  (FEFCO) closes its inner flaps first, then the outer ones hinged a board
  further out, so a closed case opens top long, top short, bottom long, bottom
  short, then the sides. Dust flaps under a
  lid, and the glue flap, fold 6° past square so the lid or the closing panel
  lands over them. Viewers start closed
  (progress 1), so opening reverses it. Body panels hinge on vertical folds,
  flaps on horizontal ones.
- Visitors without a plan see the watermark on the 3D model too (`watermark`
  prop of `DielineViewer`); the flat preview's watermark is clipped to the bleed
  (`sheetLoops`). The printed sheet (`geometry/sheet.ts`) is the bleed outline
  with every window left open; the Studio canvas and the client preview fill it
  white (`sheetFill`), exports never do. `overallRulers(result)` measures each
  separate cut part; rulers draw with arrowheads and an "N mm" label on the line.
  Bleed grows each part outward and each window inward (a window narrower than
  twice the bleed drops out). The template's rulers always show; only the
  overall ones toggle (editor top bar, client preview button), and previews pass
  `reserveRulers` so toggling never moves the drawing. On-screen SVG arrows and
  labels scale by the CSS variable `--ruler-scale` to keep their size when zoomed.
  The measure tool also snaps to fold-line ends and along fold lines.
- A dimension type keeps the typed numbers; the dieline grows (inner) or shrinks
  (outer) by the allowance (`resolveDimensions`: inner adds 2 × thickness, plus
  `INNER_CLEARANCE` 1 mm on width and length; outer takes off 2 × thickness). Rulers that measure width, length
  or height show the typed number, and their ends step in (inner) or out (outer)
  by a visible amount, not to scale (`typedRulers`, in the client and the Studio). Tucks fold 6° past square too. The 3D viewer fits the model
  with drei `Bounds`, lights it with a local `Environment` of light formers, and
  gives flute materials a kraft liner with flute ridges by pitch (`board.ts`).
- The product page shows `checkDieline` problems at the chosen size (Persian
  text in `DielineSettings`), not a rule of thumb.
- Fold direction and angle per panel are authored in the Studio's 3D dock (click
  a panel) and saved in the template as `doc.folds`, keyed by rig face index with
  `vertexCount`/`faceCount` for drift detection. The client passes them to the
  viewer as its `foldConfig`. `@repo/dieline-3d/rig` exposes the rig without
  three.js for this.
- The Studio's Settings tab is how the template is previewed (`settings` prop on
  `Studio`, plain size fields without it). The admin passes `PreviewSettings`
  (size as a customer types it, material, dimension type, bleed, thickness);
  the dieline record form (`DielineSettingsForm`: sizes sold, materials,
  images) opens from a header icon button.

### Customize mode (paid customer editor)

- A customer's copy is **the template plus a `Customization` overlay**
  (`dieline-engine/src/customize/customize.ts`), never a document of its own:
  exposed param values, optional parts switched on/off, movable parts' offsets,
  another part (or args) on an edge, and windows/holes placed relative to a
  panel's centre. A template fix reaches every copy.
- What a template allows lives in the spec: `Param.exposed` (+ `min`/`max`),
  `node.customize = { optional, move }`, `edgeFeature.customize = { choices, args }`
  and `doc.customize.cutouts`. `customizeOptions(doc)` lists it all.
- `validateCustomization` rejects anything not allowed (tampering shows, it is not
  ignored); `applyCustomization` builds the document to render;
  `verifyCustomization` also renders it and checks windows sit inside their panel
  clear of folds and that `checkDieline` finds nothing new. The Customizer shows
  exactly what the server checks.
- UI: `Customizer` in `@repo/editor` (`src/customize/`), strings overridable
  (English default; the client passes Persian from
  `apps/client/lib/dieline/customizeStrings.ts`). Overlay edits are pure
  functions in `editor/src/model/customize.ts`. The Studio's "Customer view"
  runs the Customizer on the open template with unsaved trial changes.
- Client: `/dieline/[slug]/customize` (`?saved=<id>` to reopen a copy). Access is
  `canCustomize(plan)` (`apps/client/lib/dieline/access.ts`: pro, organization),
  checked on the page and again in every server action.
- **Downloads are rendered on the server** (`downloadDieline` in
  `apps/client/actions/dieline.ts` → `verifyRequest` → `buildDielineFile`): the
  size is clamped to the template's range, the material must be offered, the
  customization verified; the browser never sends geometry.
- Saved copies and download history store the overlay as JSON in
  `CustomDielineSettings.customization` (empty for a plain resize).

### Home page (`apps/client/components/Home/`)

- A bright studio: light theme only, brand violet the only colour. The owner
  rejected dark, stark and multicolour looks, scroll-pinned category rows, and a
  scroll-jacked hero (the old 520svh pinned unfold scene was dropped as bad UX).
- `Showcase` is a normal-height hero: the pitch beside a "studio" card holding
  `FoldStage` (`@repo/dieline-3d/stage`) with a 3D / dieline toggle, an open/close
  button and slider (one motion value, never React state per frame), and
  `BoxDock`. The flat SVG is server HTML and the 3D placeholder, drawn with
  the engine's `toSVG` in die-maker colours (all home drawings use them).
- `paintPack` is the box print (a Pacsaz welcome pack on glossy board: logo
  from `logoPaths.ts`, copy, barcode, violet band; plain kraft on flute). One
  "نمایش طرح" toggle sweeps it on/off the 3D board and lays it on the 2D sheet
  inside the bleed (`printSheet.ts`, panels from the same fold rig).
- Then: the box categories, which are the editor's body types (`PresetId`, the
  engine's own drawings, each linking to the template built on it when live),
  steps, production claims, plans, FAQ, course, final call.
  Preset drawings come from `lib/dieline/homeBox.ts`; the engine loads on the
  first edit.
- `/dieline/[slug]?w=&l=&h=&m=` opens a template at that size and material, clamped.
- FAQ answers use `<details>` to stay in the HTML; `HOW_TO_STEPS` feeds both the
  visible steps and the `HowTo` data.

## `@repo/editor` rules

- All document changes go through `EditorStore.apply` (one undo step) or a
  gesture transaction (`begin` → `preview`… → `end`/`cancel`).
- Interaction logic that decides *what to write* lives in `src/model/` as pure
  functions with tests; components in `src/canvas/` only translate pointer and
  keyboard input into calls to it.
- Direct manipulation edits expressions with `offsetExpr` (adjust the trailing
  constant). A snap writes a reference only when the node's own origin (or an
  absolute point) lands exactly on the target in an untranslated frame, and
  `wouldCycle` says it is safe; other snaps align but keep the formula.
- Canvas coordinates: `toScreen`/`toWorld` in `canvas/viewport.ts`; the dieline is
  drawn through `worldMatrix(view)` with `vector-effect="non-scaling-stroke"`.
- Inspector fields bind with `useNodeField(id, path)` / `useDocField(path, match)`
  (`ui/bindings.ts`). `path` is the same dotted path the engine puts in a
  diagnostic's `field`, which is how a field shows its own error.
- `ExpressionInput` opens an undo gesture on focus and closes it on blur, so one
  field edit is one undo step; Escape cancels back to the value on focus.
- New shapes default to `origin: "center"` (`createShape`). `transform.origin` is the
  reference point: the point of a shape's bounds placed at
  `x`/`y`. `render` folds it into `NodeInfo.placement` and reports it as
  `NodeInfo.origin`; the position a transform holds is `placePoint(origin, placement)`.
- Commands for the palette live in `commands.ts`; add new actions there so they
  are searchable.

## Conventions

- TypeScript strict with `noUncheckedIndexedAccess`; packages export source `.ts`
  directly (no build step).
- Comments explain *why*, in full sentences, matching the existing code.
- Admin UI text is English; client UI text is Persian.
- The user commits. At the end of each phase, stop and give a commit message.
