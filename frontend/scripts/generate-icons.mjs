import sharp from "sharp";
import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const svgPath = resolve("public/plyndrox-logo.svg");
const svg = readFileSync(svgPath);

const targets = [
  { size: 16, out: "public/icons/plyndrox-16.png" },
  { size: 32, out: "public/icons/plyndrox-32.png" },
  { size: 48, out: "public/icons/plyndrox-48.png" },
  { size: 180, out: "public/icons/plyndrox-180.png" },
  { size: 192, out: "public/icons/plyndrox-192.png" },
  { size: 512, out: "public/icons/plyndrox-512.png" },
];

for (const { size, out } of targets) {
  await sharp(svg, { density: Math.max(72, size * 4) })
    .resize(size, size, { fit: "contain", background: { r: 9, g: 9, b: 11, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(resolve(out));
  console.log("wrote", out);
}

const icoSrcs = ["public/icons/plyndrox-16.png", "public/icons/plyndrox-32.png", "public/icons/plyndrox-48.png"];
execSync(`magick ${icoSrcs.join(" ")} public/favicon.ico`, { stdio: "inherit" });
console.log("wrote public/favicon.ico");

const sizedSvg = (size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" role="img" aria-label="Plyndrox AI logo"><rect width="512" height="512" rx="116" fill="#09090B"/><path fill="#FFFFFF" fill-rule="evenodd" d="M156 384V139h115c68 0 113 39 113 99 0 61-45 100-113 100h-57v46h-58Zm58-98h53c36 0 58-18 58-48 0-29-22-47-58-47h-53v95Z"/></svg>\n`;

writeFileSync("public/icons/plyndrox-192.svg", sizedSvg(192));
writeFileSync("public/icons/plyndrox-512.svg", sizedSvg(512));
console.log("wrote sized SVGs");
