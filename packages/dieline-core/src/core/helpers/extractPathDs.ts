export function extractPathDs(svgString: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  const paths = Array.from(doc.querySelectorAll("path"));

  return paths.map((p) => p.getAttribute("d")!).filter(Boolean);
}
