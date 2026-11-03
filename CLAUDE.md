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
- Panels expose dotted anchors and scalars: `@body.front.topLeft.x`,
  `@body.front.width`, plus `bodyWidth`/`bodyHeight`. `lookupRef` reads a path as
  "everything before a trailing x/y is the point name".
- Built-in components live in `dieline-engine/src/library/components.ts`, written
  in the spec format (`lib:tuckLid`, `lib:dustFlap`, `lib:glueFlap`,
  `lib:slottedFlap`, `lib:plainFlap`, `lib:thumbNotch`). Size params default to 0
  meaning "auto" and are resolved in the component's variables. A document
  component with the same id shadows a built-in one.
- Presets (`library/presets.ts`): reverse tuck end, straight tuck end, sleeve,
  FEFCO 0201. New presets must render without diagnostics and keep the cut
  outline closed at several sizes (see `panels.test.ts`).

### Packaging checks, nicks, 3D

- `checkDieline(result)` (`dieline-engine/src/checks/checks.ts`) finds gaps and
  open cut ends, double knives, crossing lines, folds that end in the board and
  tiny segments, on the rendered geometry. **Every preset must pass it with no
  issues** (`checks.test.ts`); it already caught dust flaps running down the
  lid's cut line.
- `addNicks(paths, { width, spacing })` splits cut lines for bridges; `toSVG` /
  `toDXF` take `nicks` too. `toFoldSVG(result)` writes the `trim`/`fold`/`perf`
  SVG that `@repo/dieline-3d` folds.
- In the Studio, `useAnalysis()` (`editor/src/state/analysis.ts`) renders the
  template at `sizeRange.min/max` (ghosts) and runs the checks at all three
  sizes, cached per render. The admin passes each dieline's min/max dimensions.
- Polygons can be sized by side (`sizeBy: "side"`); the Triangle tool draws
  three-sided polygons that way.
- Bleed (`geometry/bleed.ts`) is the outermost closed cut loop offset outward
  with round corners; it does not use makerjs (too slow, and wrong on narrow
  notches). `export.test.ts` checks it on every preset at several distances.

### 3D folding

- The fold animation is staged (`dieline-3d/src/schedule.ts`): the body panels
  one by one, then the bottom flaps, then the top flaps (flaps on flaps a step
  later). Viewers start closed (progress 1), so opening shows the top first,
  then the bottom, then the sides. Body panels hinge on vertical folds, flaps on
  horizontal ones.
- Visitors without a plan see the watermark on the 3D model too (`watermark`
  prop of `DielineViewer`); the flat preview's watermark is clipped to the bleed
  (`closedPathD`).
- Fold direction and angle per panel are authored in the Studio's 3D dock (click
  a panel) and saved in the template as `doc.folds`, keyed by rig face index with
  `vertexCount`/`faceCount` for drift detection. The client passes them to the
  viewer as its `foldConfig`. `@repo/dieline-3d/rig` exposes the rig without
  three.js for this.
- The Studio's Settings tab hosts the app's template settings form
  (`settings` prop on `Studio`; the admin passes `DielineSettingsForm`).

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
- Commands for the palette live in `commands.ts`; add new actions there so they
  are searchable.

## Conventions

- TypeScript strict with `noUncheckedIndexedAccess`; packages export source `.ts`
  directly (no build step).
- Comments explain *why*, in full sentences, matching the existing code.
- Admin UI text is English; client UI text is Persian.
- The user commits. At the end of each phase, stop and give a commit message.
