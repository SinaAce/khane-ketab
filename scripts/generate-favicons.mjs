import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public/logos/option-a.png");

const BG = { r: 250, g: 246, b: 240, alpha: 255 };

async function makeIcon(out, size) {
  const meta = await sharp(src).metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.round((meta.width - side) / 2);
  const top = Math.round((meta.height - side) / 2);
  const padding = Math.round(size * 0.12);
  const inner = size - padding * 2;

  const logo = await sharp(src)
    .extract({ left, top, width: side, height: side })
    .resize(inner, inner, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(out);
}

const targets = [
  { out: path.join(root, "src/app/icon.png"), size: 48 },
  { out: path.join(root, "src/app/apple-icon.png"), size: 180 },
  { out: path.join(root, "public/favicon.png"), size: 48 },
  { out: path.join(root, "public/favicon.ico"), size: 48 },
  { out: path.join(root, "public/apple-icon.png"), size: 180 },
];

await Promise.all(targets.map(({ out, size }) => makeIcon(out, size)));

console.log("Favicons regenerated with visible background");
