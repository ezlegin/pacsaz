/**
 * Captures every dieline's 2D image, the same picture as the settings form's
 * "Capture 2D" button: the die at the template's saved size, no bleed or rulers,
 * centred on light grey, square.
 *
 *   tsx --env-file=.env scripts/capture-dielines.ts <out dir>            (images only)
 *   tsx --env-file=.env scripts/capture-dielines.ts <out dir> --upload   (and save them)
 *
 * With --upload each image becomes the dieline's image on Cloudinary, replacing
 * (and deleting) the earlier one, as an upload through the form does.
 */
import { prisma } from "@repo/db";
import { parseDocument, render, toSVG } from "@repo/dieline-engine";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// sharp comes with Next.js; it is not a dependency of its own.
const local = createRequire(import.meta.url);
const sharp = createRequire(local.resolve("next/package.json"))("sharp") as typeof import("sharp");

// Kept in step with components/ModelCapture.tsx and components/DielineCapture.tsx.
const SIZE = 1024;
const BACKGROUND = "#f4f4f4";
const FILL = 0.88;
const STROKE_PX = 2.2;

async function draw(specification: string, s: { width: number; length: number; height: number; thickness: number }): Promise<Buffer | null> {
  const parsed = parseDocument(JSON.parse(specification));
  if (!parsed.ok) return null;
  const result = render(parsed.document, { width: s.width, length: s.length, height: s.height, thickness: s.thickness, bleed: 0 });
  if (!result.paths.length) return null;

  const options = { includeBleed: false, includeRulers: false, padding: 0 } as const;
  const [, , w = 0, h = 0] = (toSVG(result, options).match(/viewBox="([^"]+)"/)?.[1] ?? "").split(" ").map(Number);
  if (!(w > 0 && h > 0)) return null;
  const pxPerMm = (SIZE * FILL) / Math.max(w, h);
  const dw = Math.round(w * pxPerMm);
  const dh = Math.round(h * pxPerMm);
  const svg = toSVG(result, { ...options, strokeWidth: STROKE_PX / pxPerMm }).replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${dw}" height="${dh}"`);

  const drawing = await sharp(Buffer.from(svg)).resize(dw, dh).png().toBuffer();
  return sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: BACKGROUND } })
    .composite([{ input: drawing, left: Math.round((SIZE - dw) / 2), top: Math.round((SIZE - dh) / 2) }])
    .webp({ quality: 92 })
    .toBuffer();
}

async function main() {
  const out = process.argv[2];
  if (!out) throw new Error("Give an output folder.");
  const upload = process.argv.includes("--upload");
  mkdirSync(out, { recursive: true });

  const dielines = await prisma.dieline.findMany({ include: { settings: true, dielineImage: true }, orderBy: { id: "asc" } });
  for (const d of dielines) {
    let image: Buffer | null = null;
    try {
      image = d.settings ? await draw(d.specification, d.settings) : null;
    } catch (error) {
      console.log(`${d.slug}: failed (${error instanceof Error ? error.message : error})`);
      continue;
    }
    if (!image) {
      console.log(`${d.slug}: skipped, no drawing`);
      continue;
    }
    const file = join(out, `${d.slug}.webp`);
    writeFileSync(file, image);
    if (!upload) {
      console.log(`${d.slug}: ${file}`);
      continue;
    }

    const res = await new Promise<UploadApiResponse>((resolve, reject) =>
      cloudinary.uploader
        .upload_stream({ folder: "/images/dieline", format: "webp", resource_type: "image", transformation: [{ width: 800, crop: "limit" }] }, (error, result) =>
          error || !result ? reject(error) : resolve(result),
        )
        .end(image),
    );
    const data = { url: res.secure_url, publicId: res.public_id };
    await prisma.dielineImage.upsert({ where: { dielineId: d.id }, update: data, create: { ...data, dielineId: d.id } });
    if (d.dielineImage) await cloudinary.uploader.destroy(d.dielineImage.publicId);
    console.log(`${d.slug}: saved ${res.secure_url}`);
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
