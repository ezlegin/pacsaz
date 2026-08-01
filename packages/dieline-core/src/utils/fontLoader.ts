import * as opentype from "opentype.js";

const fontCache = new Map<string, Promise<opentype.Font>>();

export function loadFont(url: string): Promise<opentype.Font> {
  let pending = fontCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch font: ${url} (${res.status})`);
        return res.arrayBuffer();
      })
      .then((buffer) => opentype.parse(buffer));
    fontCache.set(url, pending);
  }
  return pending;
}

// Public path — must be servable over HTTP, e.g. put arial.woff in /public/fonts/
export const ARIAL_PATH = "/fonts/ARIAL.TTF";
