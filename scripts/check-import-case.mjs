#!/usr/bin/env node
/**
 * Guards against case-only path bugs, the kind that pass locally on Windows but
 * fail the Linux build with "Module not found".
 *
 * Windows (and macOS) resolve `./model` to `Model.ts`, so a wrong-cased relative
 * import and a working tree that disagrees with git's index stay invisible until
 * a case-sensitive filesystem checks out the repository. This script fails when:
 *
 *   1. a relative import only resolves case-insensitively, or
 *   2. a file that git tracks exists on disk under a different casing.
 *
 * Usage: node scripts/check-import-case.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const git = (args) =>
  execFileSync("git", args, { encoding: "utf8" })
    .split("\0")
    .filter(Boolean)
    .map((file) => file.replace(/\\/g, "/"));

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const tracked = git(["ls-files", "-z"]);
const untracked = git(["ls-files", "-z", "--others", "--exclude-standard"]);
const files = [...new Set([...tracked, ...untracked])];

// Case-sensitive membership: JavaScript string comparison is ordinal.
const exact = new Set(files);
const lower = new Map(files.map((file) => [file.toLowerCase(), file]));

const SPECIFIER = /(?:from\s*|import\s*\(\s*)["'](\.[^"']*)["']/g;
const candidates = (base) => [
  `${base}/index.ts`,
  `${base}/index.tsx`,
  `${base}.ts`,
  `${base}.tsx`,
];

const problems = [];
const unresolved = [];

for (const file of files) {
  if (!/\.(ts|tsx)$/.test(file)) continue;

  const abs = path.join(repoRoot, file);
  if (!existsSync(abs)) continue;

  const text = readFileSync(abs, "utf8");
  const dir = path.posix.dirname(file);

  for (const [, specifier] of text.matchAll(SPECIFIER)) {
    const base = path.posix.normalize(path.posix.join(dir, specifier));
    const paths = candidates(base);

    if (paths.some((candidate) => exact.has(candidate))) continue;

    const caseInsensitiveHit = paths
      .map((candidate) => lower.get(candidate.toLowerCase()))
      .find(Boolean);

    if (caseInsensitiveHit) {
      problems.push(
        `${file}\n    imports "${specifier}"\n    but the file is ${caseInsensitiveHit}`,
      );
    } else {
      // Generated code (Prisma client) and dead files land here; bundlers report
      // those themselves, so this is informational only.
      unresolved.push(`${file}  ->  ${specifier}`);
    }
  }
}

// A tracked path that exists on disk under a different casing means the working
// tree and the deployed checkout disagree.
const listings = new Map();
for (const file of tracked) {
  const dir = path.posix.dirname(file);
  if (!listings.has(dir)) {
    const abs = path.join(repoRoot, dir === "." ? "" : dir);
    listings.set(dir, existsSync(abs) ? new Set(readdirSync(abs)) : new Set());
  }
  const name = path.posix.basename(file);
  if (!listings.get(dir).has(name)) {
    problems.push(`git index has ${file} but the working tree names it differently`);
  }
}

if (problems.length > 0) {
  console.error(
    `\ncheck-import-case: ${problems.length} case problem(s) found — these break case-sensitive builds:\n`,
  );
  for (const problem of problems) console.error(`  ${problem}\n`);
  process.exit(1);
}

console.log(
  `check-import-case: ${files.length} files checked, no case mismatches.`,
);
if (unresolved.length > 0) {
  console.log(
    `  (${unresolved.length} relative import(s) resolve to nothing, e.g. generated code: ${unresolved[0]})`,
  );
}
