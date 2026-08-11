// Generates resized WebP variants of the hero/showcase source images into
// public/optimized/. Source PNGs in public/ stay untouched (imag1-3 are
// 2816x1536, ~7MB each — used raw they'd wreck LCP on the mobile-first PWA).
// Idempotent and cheap (3 source images), so it's safe to run on every
// build/start rather than requiring a manual step.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SOURCES = ["imag1", "imag2", "imag3"];
const WIDTHS = [1600, 900, 480];
const PUBLIC_DIR = path.resolve("public");
const OUT_DIR = path.resolve("public/optimized");

async function run() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  for (const name of SOURCES) {
    const srcPath = path.join(PUBLIC_DIR, `${name}.png`);
    if (!existsSync(srcPath)) {
      console.warn(`optimize-images: skipping ${name}.png (not found in public/)`);
      continue;
    }

    for (const width of WIDTHS) {
      const outPath = path.join(OUT_DIR, `${name}-${width}.webp`);
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(outPath);
    }
    console.log(`optimize-images: ${name}.png -> ${WIDTHS.length} WebP variants`);
  }
}

run().catch((err) => {
  console.error("optimize-images failed:", err);
  process.exit(1);
});
