import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const normalizeRepoPath = (fromFile, value) => {
  const cleanValue = value.split(/[?#]/)[0].trim();

  if (
    !cleanValue ||
    cleanValue.startsWith("#") ||
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("mailto:") ||
    cleanValue.startsWith("tel:") ||
    cleanValue.startsWith("data:")
  ) {
    return "";
  }

  return path
    .relative(root, path.resolve(root, path.dirname(fromFile), cleanValue))
    .replaceAll(path.sep, "/");
};

const recordMissing = (label, file, value) => {
  failures.push(`${label}: ${file} -> ${value}`);
};

const checkHtmlReferences = (file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const patterns = [
    /\s(?:href|src)=["']([^"']+)["']/g,
    /url=([^"'>\s]+)/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const repoPath = normalizeRepoPath(file, match[1]);

      if (repoPath && !exists(repoPath)) {
        recordMissing("missing html reference", file, match[1]);
      }
    }
  }
};

const checkServiceWorkerCache = () => {
  const file = "service-worker.js";
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const cacheMatch = source.match(/const CORE_CACHE = \[([\s\S]*?)\];/);

  if (!cacheMatch) {
    failures.push("service worker: CORE_CACHE not found");
    return;
  }

  for (const match of cacheMatch[1].matchAll(/"([^"]+)"/g)) {
    const value = match[1];
    const repoPath = value === "./" ? "index.html" : value.replace(/^\.\//, "");

    if (!exists(repoPath)) {
      recordMissing("missing service worker cache asset", file, value);
    }
  }
};

const checkLetterAudio = () => {
  const sandbox = { window: {} };
  const source = fs.readFileSync(path.join(root, "data/letters.js"), "utf8");

  vm.runInNewContext(source, sandbox, { filename: "data/letters.js" });

  const letters = sandbox.window.letters || [];
  const referencedAudio = [];

  for (const letter of letters) {
    referencedAudio.push([letter.id, letter.baseAudio]);

    for (const [vowelType, audioPath] of Object.entries(letter.vowelAudio || {})) {
      referencedAudio.push([`${letter.id}.${vowelType}`, audioPath]);
    }
  }

  for (const [id, audioPath] of referencedAudio) {
    const repoPath = audioPath.replace(/^\.\.\//, "");

    if (!exists(repoPath)) {
      recordMissing("missing letter audio", `data/letters.js:${id}`, audioPath);
    }
  }

  return {
    letters: letters.length,
    audioReferences: referencedAudio.length,
  };
};

const htmlFiles = [
  "index.html",
  ...fs.readdirSync(path.join(root, "pages"))
    .filter((file) => file.endsWith(".html"))
    .map((file) => `pages/${file}`),
];

for (const file of htmlFiles) {
  checkHtmlReferences(file);
}

const audioSummary = checkLetterAudio();
checkServiceWorkerCache();

if (failures.length) {
  console.error("Static asset verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Static asset verification passed: ${htmlFiles.length} HTML files, ${audioSummary.letters} letters, ${audioSummary.audioReferences} audio references.`,
);
