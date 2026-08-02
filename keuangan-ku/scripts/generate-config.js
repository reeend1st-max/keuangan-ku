// scripts/generate-config.js
//
// Runs during the Vercel build step. Reads SUPABASE_URL and SUPABASE_ANON_KEY from
// the environment and writes them into public/config.js, ensuring all static assets
// are cleanly synced into the public/ output directory.

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");

// Ensure public directories exist
const dirsToCreate = [
  publicDir,
  path.join(publicDir, "css"),
  path.join(publicDir, "js"),
  path.join(publicDir, "vendor"),
  path.join(publicDir, "assets"),
];

dirsToCreate.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Sync files between root and public structure
const filesToCopy = [
  { src: "index.html", dest: "index.html" },
  { src: "manifest.json", dest: "manifest.json" },
  { src: "sw.js", dest: "sw.js" },
  { src: "style.css", dest: "css/style.css" },
  { src: "api.js", dest: "js/api.js" },
  { src: "app.js", dest: "js/app.js" },
  { src: "react.production.min.js", dest: "vendor/react.production.min.js" },
  { src: "react-dom.production.min.js", dest: "vendor/react-dom.production.min.js" },
  { src: "supabase.js", dest: "vendor/supabase.js" },
  { src: "favicon-32.png", dest: "assets/favicon-32.png" },
  { src: "icon-192.png", dest: "assets/icon-192.png" },
  { src: "icon-512.png", dest: "assets/icon-512.png" },
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(rootDir, src);
  const destPath = path.join(publicDir, dest);
  
  if (fs.existsSync(srcPath) && fs.existsSync(destPath)) {
    const srcStat = fs.statSync(srcPath);
    const destStat = fs.statSync(destPath);
    if (destStat.mtimeMs > srcStat.mtimeMs) {
      fs.copyFileSync(destPath, srcPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  } else if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  } else if (fs.existsSync(destPath)) {
    fs.copyFileSync(destPath, srcPath);
  }
});

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

const outPath = path.join(publicDir, "config.js");

const contents =
  "// AUTO-GENERATED at build time by scripts/generate-config.js — do not edit by hand.\n" +
  "window.__SUPABASE_CONFIG__ = " +
  JSON.stringify({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY }, null, 2) +
  ";\n";

fs.writeFileSync(outPath, contents, "utf8");
console.log("✅ Successfully synced build assets in public/ directory.");
