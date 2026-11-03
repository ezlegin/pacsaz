export * from "./spec/types";
export { parseDocument, documentSchema, LIMITS, type ParseResult } from "./spec/schema";

export {
  compile,
  dependencies,
  ExprError,
  EXPRESSION_FUNCTIONS,
  type Compiled,
  type Ref,
} from "./expr/expr";

export {
  render,
  type RenderInputs,
  type RenderResult,
  type NodeInfo,
  type RulerInfo,
} from "./eval/render";
export type { Diagnostic } from "./eval/diagnostics";
export { evaluateExpression } from "./eval/evaluate";
export { BUILTINS, type Scope } from "./eval/scope";
export { resolveDimensions, type DimensionType, type Dimensions } from "./eval/dimensions";

export type { Bounds, Path, Prim, Pt } from "./geometry/types";
export { pathsBounds, primLength, endpoints } from "./geometry/math";

export { formatNumber, offsetExpr, refExpr, renameRefs, referencedNodes } from "./edit/exprEdit";
export {
  findNode,
  allNodes,
  updateNode,
  removeNodes,
  insertNodes,
  duplicateNodes,
  moveNode,
  renameNode,
  renameSymbol,
  mapExprs,
  newId,
  uniqueName,
  type Located,
} from "./edit/tree";
export { placePoint, IDENTITY, type Placement } from "./geometry/math";

export { toSVG, exportBounds, type SvgOptions } from "./export/svg";
export { toDXF } from "./export/dxf";
export { LINE_STYLES, DXF_LAYERS, type LineStyle } from "./export/styles";
