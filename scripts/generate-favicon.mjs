import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const PRIMARY = "#3A3834";
const FOREGROUND = "#FAFAF8";
const ACCENT = "#2F7A6D";

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const radius = size * 0.21875;

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = PRIMARY;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(size, size * 0.3125);
  ctx.quadraticCurveTo(size, 0, size * 0.6875, 0);
  ctx.lineTo(size, 0);
  ctx.closePath();
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.45;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = FOREGROUND;
  ctx.font = `italic ${size * 0.53125}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", size / 2, size * 0.58);

  return canvas.toBuffer("image/png");
}

function pngToIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  const data = [];

  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    data.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...data]);
}

const images = [16, 32, 48].map((size) => ({
  size,
  png: drawIcon(size),
}));

fs.writeFileSync(path.join(publicDir, "favicon.ico"), pngToIco(images));
console.log("Generated public/favicon.ico");
