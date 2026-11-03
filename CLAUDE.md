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
| `packages/editor` | **Editor v2 UI**: `EditorStore` (document, history, selection, view) and the interactive `Canvas`. |
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

## Conventions

- TypeScript strict with `noUncheckedIndexedAccess`; packages export source `.ts`
  directly (no build step).
- Comments explain *why*, in full sentences, matching the existing code.
- Admin UI text is English; client UI text is Persian.
- The user commits. At the end of each phase, stop and give a commit message.
