import M from "makerjs";

/**
 * Flatten every descendant path into a single model's paths map.
 * Geometry is untouched; this just makes the tree "look" like one shape
 * for downstream consumers (SVG export, further booleans, stroke drawing).
 */
export function applyJoin(model: M.IModel): M.IModel {
  const merged: M.IModel = { paths: {} };

  const walk = (node: M.IModel) => {
    if (node.paths) {
      for (const [key, path] of Object.entries(node.paths)) {
        merged.paths![`${Object.keys(merged.paths!).length}-${key}`] = path;
      }
    }
    if (node.models) {
      for (const child of Object.values(node.models)) walk(child);
    }
  };

  walk(model);
  return merged;
}
