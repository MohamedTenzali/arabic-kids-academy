import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const warnings = [];

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const cleanReference = (value) => {
  const cleanValue = value.split(/[?#]/)[0].trim();

  if (
    !cleanValue ||
    cleanValue.startsWith("#") ||
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("mailto:") ||
    cleanValue.startsWith("tel:") ||
    cleanValue.startsWith("data:") ||
    cleanValue.startsWith("javascript:")
  ) {
    return "";
  }

  return cleanValue;
};

const decodePath = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeRepoPath = (fromFile, value) => {
  const cleanValue = cleanReference(value);

  if (!cleanValue) {
    return "";
  }

  if (cleanValue.startsWith("/")) {
    warnings.push(`root-relative path is not subpath-ready: ${fromFile} -> ${value}`);
    return cleanValue.replace(/^\/+/, "");
  }

  const decodedValue = decodePath(cleanValue);

  return path
    .relative(root, path.resolve(root, path.dirname(fromFile), decodedValue))
    .replaceAll(path.sep, "/");
};

const recordMissing = (label, file, value) => {
  failures.push(`${label}: ${file} -> ${value}`);
};

const checkReference = (label, file, value) => {
  const repoPath = normalizeRepoPath(file, value);

  if (repoPath && !exists(repoPath)) {
    recordMissing(label, file, value);
  }
};

const checkHtmlReferences = (file) => {
  const html = read(file);
  const patterns = [
    /\s(?:href|src|poster|action)=["']([^"']+)["']/g,
    /\s(?:srcset)=["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const values = match[1]
        .split(",")
        .map((item) => item.trim().split(/\s+/)[0])
        .filter(Boolean);

      for (const value of values) {
        checkReference("missing html reference", file, value);
      }
    }
  }
};

const checkCssReferences = (file) => {
  const css = read(file);

  for (const match of css.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^'")]+))\)/g)) {
    checkReference("missing css reference", file, match[1] || match[2] || match[3]);
  }
};

const checkManifest = () => {
  const file = "manifest.json";
  const manifest = JSON.parse(read(file));

  for (const icon of manifest.icons || []) {
    checkReference("missing manifest icon", file, icon.src);
  }

  if (manifest.start_url && manifest.start_url !== "./") {
    checkReference("missing manifest start_url", file, manifest.start_url);
  }
};

const checkServiceWorkerCache = () => {
  const file = "service-worker.js";
  const source = read(file);
  const cacheMatch = source.match(/const CORE_CACHE = \[([\s\S]*?)\];/);

  if (!cacheMatch) {
    failures.push("service worker: CORE_CACHE not found");
    return 0;
  }

  let cachedAssets = 0;

  for (const match of cacheMatch[1].matchAll(/"([^"]+)"/g)) {
    const value = match[1];
    const repoPath = value === "./" ? "index.html" : decodePath(value.replace(/^\.\//, ""));
    cachedAssets += 1;

    if (!exists(repoPath)) {
      recordMissing("missing service worker cache asset", file, value);
    }
  }

  return cachedAssets;
};

const runDataFile = (file) => {
  const sandbox = { window: {} };
  vm.runInNewContext(read(file), sandbox, { filename: file });
  return sandbox.window;
};

const checkLetterAudio = () => {
  const { letters = [] } = runDataFile("data/letters.js");
  const referencedAudio = [];

  for (const letter of letters) {
    referencedAudio.push([letter.id, letter.baseAudio]);

    for (const [vowelType, audioPath] of Object.entries(letter.vowelAudio || {})) {
      referencedAudio.push([`${letter.id}.${vowelType}`, audioPath]);
    }
  }

  for (const [id, audioPath] of referencedAudio) {
    checkReference("missing letter audio", `data/letters.js:${id}`, audioPath);
  }

  return {
    letters,
    audioReferences: referencedAudio.length,
  };
};

const parseLetterWorksheetPaths = () => {
  const file = "js/app.js";
  const source = read(file);
  const match = source.match(/const letterWorksheetPaths = ({[\s\S]*?});/);

  if (!match) {
    failures.push("js/app.js: letterWorksheetPaths not found");
    return {};
  }

  return vm.runInNewContext(`(${match[1]})`, {}, { filename: file });
};

const checkLetterWorksheets = (letters) => {
  const file = "js/app.js";
  const worksheetPaths = parseLetterWorksheetPaths();

  for (const letter of letters) {
    const fallback = `../docs/letter-worksheets/${encodeURIComponent(letter.id)}.pdf`;
    const worksheetPath = letter.worksheetSrc || worksheetPaths[letter.id] || fallback;
    checkReference("missing letter worksheet PDF", file, worksheetPath);
  }
};

const checkLearningRoutes = () => {
  const { learningLevels = [] } = runDataFile("data/progress.js");

  for (const level of learningLevels) {
    for (const step of level.steps || []) {
      if (step.href) {
        checkReference("missing learning route", "pages/roadmap.html", step.href);
      }
    }
  }
};

const htmlFiles = [
  "index.html",
  ...fs.readdirSync(path.join(root, "pages"))
    .filter((file) => file.endsWith(".html"))
    .map((file) => `pages/${file}`),
];
const cssFiles = fs.readdirSync(path.join(root, "css"))
  .filter((file) => file.endsWith(".css"))
  .map((file) => `css/${file}`);

for (const file of htmlFiles) {
  checkHtmlReferences(file);
}

for (const file of cssFiles) {
  checkCssReferences(file);
}

checkManifest();
const audioSummary = checkLetterAudio();
checkLetterWorksheets(audioSummary.letters);
checkLearningRoutes();
const cachedAssets = checkServiceWorkerCache();

if (warnings.length) {
  console.warn("Static asset verification warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (failures.length) {
  console.error("Static asset verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Static asset verification passed: ${htmlFiles.length} HTML files, ${cssFiles.length} CSS files, ${audioSummary.letters.length} letters, ${audioSummary.audioReferences} audio references, ${cachedAssets} service-worker cache entries.`,
);
