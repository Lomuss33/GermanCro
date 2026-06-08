import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOMAIN = "germancro.live";
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, "dist");

const ROOT_FILES = [
  "index.html",
  "app.js",
  "style.css",
  "logo.svg",
  "cards.json",
  "cards.user.json",
  "locales.json",
  "germany-facts.json",
  "europe-facts.json",
  "world-facts.json",
  "grammar-slider-table.js",
  "pretext-layout.js",
];

const DIRECTORIES = [
  "assets",
  "shared",
  "src",
  "vendor/pretext/dist",
];

const PUBLIC_FILES = [
  "robots.txt",
  "sitemap.xml",
  "www-redirect.html",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function copyFile(sourceRelativePath, targetRelativePath = sourceRelativePath) {
  const sourcePath = path.join(ROOT, sourceRelativePath);
  const targetPath = path.join(DIST, targetRelativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
}

async function copyDirectory(relativePath) {
  const sourcePath = path.join(ROOT, relativePath);
  const targetPath = path.join(DIST, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.cp(sourcePath, targetPath, { recursive: true });
}

async function verifySourceFiles() {
  const cname = await fs.readFile(path.join(ROOT, "CNAME"), "utf8");
  assert(cname === DOMAIN, `CNAME must contain exactly ${DOMAIN}`);

  const html = await fs.readFile(path.join(ROOT, "index.html"), "utf8");
  assert(
    html.includes('<link rel="canonical" href="https://germancro.live/">'),
    "index.html is missing the canonical URL tag",
  );
  assert(
    html.includes('<meta property="og:url" content="https://germancro.live/">'),
    "index.html is missing the Open Graph URL tag",
  );
  assert(html.includes('<meta name="description" content="'), "index.html is missing a description tag");

  const robots = await fs.readFile(path.join(ROOT, "public", "robots.txt"), "utf8");
  assert(robots.includes("Sitemap: https://germancro.live/sitemap.xml"), "robots.txt is missing the sitemap URL");

  const sitemap = await fs.readFile(path.join(ROOT, "public", "sitemap.xml"), "utf8");
  assert(sitemap.includes("<loc>https://germancro.live/</loc>"), "sitemap.xml is missing the canonical homepage URL");
}

async function verifyDistFiles() {
  for (const relativePath of [
    "index.html",
    "CNAME",
    "robots.txt",
    "sitemap.xml",
  ]) {
    await fs.access(path.join(DIST, relativePath));
  }

  const distCname = await fs.readFile(path.join(DIST, "CNAME"), "utf8");
  assert(distCname === DOMAIN, `dist/CNAME must contain exactly ${DOMAIN}`);
}

await verifySourceFiles();

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

for (const relativePath of ROOT_FILES) {
  await copyFile(relativePath);
}

for (const relativePath of DIRECTORIES) {
  await copyDirectory(relativePath);
}

for (const filename of PUBLIC_FILES) {
  await copyFile(path.posix.join("public", filename), filename);
}

await fs.writeFile(path.join(DIST, "CNAME"), DOMAIN, "utf8");

await verifyDistFiles();

console.log("build passed");
