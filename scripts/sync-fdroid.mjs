import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPO = "https://f-droid.org/repo";
const LIMIT = 2000;

const CAT_MAP = {
  System: "tools",
  Development: "tools",
  Connectivity: "tools",
  Security: "tools",
  Navigation: "tools",
  Theming: "tools",
  "Keyboard & IME": "tools",
  Internet: "communication",
  Multimedia: "video",
  Graphics: "photography",
  Games: "casual",
  Money: "finance",
  Writing: "productivity",
  Time: "productivity",
  Reading: "productivity",
  "Science & Education": "productivity",
  "Sports & Health": "sports",
};

function loc(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const picked = value["en-US"] || value.en || Object.values(value)[0];
    return loc(picked);
  }
  return String(value);
}

function fileName(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.name) return value.name;
  const inner = value["en-US"] || value.en || Object.values(value)[0];
  if (inner && inner !== value) return fileName(inner);
  return "";
}

function localizedList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const inner = value["en-US"] || value.en || Object.values(value)[0];
  return localizedList(inner);
}

function fileUrl(name) {
  if (!name) return "";
  if (name.startsWith("http")) return name;
  return `${REPO}/${String(name).replace(/^\//, "")}`;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function formatBytes(n) {
  if (!n) return "—";
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${Math.max(1, Math.round(n / (1024 * 1024)))} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

function formatDate(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapCategory(fdroidCats) {
  const first = Array.isArray(fdroidCats) ? fdroidCats[0] : "";
  return CAT_MAP[first] || "tools";
}

console.log("Downloading F-Droid index-v2.json (~62MB)...");
const res = await fetch("https://f-droid.org/repo/index-v2.json");
if (!res.ok) {
  throw new Error(`F-Droid index HTTP ${res.status}`);
}
const index = await res.json();
const packages = index.packages || {};
const rows = [];

for (const [packageName, entry] of Object.entries(packages)) {
  const meta = entry.metadata || {};
  const versionsObj = entry.versions || {};
  const versions = Object.values(versionsObj)
    .map((v) => {
      const manifest = v.manifest || {};
      const file = v.file || {};
      return {
        version: String(manifest.versionName || manifest.versionCode || "unknown"),
        versionCode: Number(manifest.versionCode || 0),
        date: formatDate(v.added),
        size: formatBytes(file.size),
        notes: "Official F-Droid build",
        apkUrl: fileUrl(file.name),
        minSdk: manifest.usesSdk?.minSdkVersion,
      };
    })
    .filter((v) => v.apkUrl)
    .sort((a, b) => b.versionCode - a.versionCode);

  if (!versions.length) continue;

  const latest = versions[0];
  const name = loc(meta.name) || packageName;
  const summary = stripHtml(loc(meta.summary));
  const description = stripHtml(loc(meta.description)) || summary;
  const icon = fileUrl(fileName(meta.icon)) || `${REPO}/${packageName}/en-US/icon.png`;
  const shots = [];
  const shotArr = localizedList(meta.screenshots?.phone);
  for (const shot of shotArr.slice(0, 6)) {
    const url = fileUrl(fileName(shot));
    if (url) shots.push(url);
  }

  const fdroidCats = meta.categories || [];
  const category = mapCategory(fdroidCats);
  const kind = fdroidCats.some((c) => /game/i.test(String(c))) ? "game" : "app";
  const slug = packageName.replaceAll(".", "-").toLowerCase();

  rows.push({
    slug,
    name,
    developer: meta.authorName || meta.authorEmail || "F-Droid community",
    packageName,
    kind,
    category,
    license: meta.license || "Open source",
    sourceUrl: meta.sourceCode || `https://f-droid.org/packages/${packageName}/`,
    iconUrl: icon,
    screenshots: shots,
    apkUrl: latest.apkUrl,
    rating: 0,
    ratingsCount: "",
    downloads: "F-Droid",
    size: latest.size,
    version: latest.version,
    updated: formatDate(meta.lastUpdated || latest.date),
    requires: latest.minSdk ? `Android API ${latest.minSdk}+` : "Android",
    age: "Everyone",
    featured: false,
    hot: false,
    isNew: false,
    popular24h: false,
    accent: "#15c15d",
    accent2: "#064e3b",
    letter: name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "A",
    short: summary.slice(0, 140) || `${name} from F-Droid`,
    description: description.slice(0, 2500),
    whatsNew: `Latest F-Droid version ${latest.version}.`,
    versions: versions.slice(0, 8),
    lastUpdated: Number(meta.lastUpdated || 0),
    reviews: [],
  });
}

rows.sort((a, b) => {
  const score = (x) => (x.iconUrl ? 2 : 0) + (x.screenshots.length ? 1 : 0);
  return score(b) - score(a) || b.lastUpdated - a.lastUpdated;
});
const games = rows.filter((a) => a.kind === "game");
const rest = rows.filter((a) => a.kind !== "game");
const gameTake = Math.min(350, games.length);
const selected = [...games.slice(0, gameTake), ...rest.slice(0, LIMIT - gameTake)];
selected.forEach((app, i) => {
  app.featured = i < 8;
  app.hot = i < 40;
  app.isNew = i < 24;
  app.popular24h = i < 32;
  delete app.lastUpdated;
});

const outDir = join(ROOT, "data");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "fdroid-apps.json");
writeFileSync(outFile, JSON.stringify(selected));
console.log(`Wrote ${selected.length} real F-Droid apps to data/fdroid-apps.json`);
console.log(`Tools: ${selected.filter((a) => a.category === "tools").length}`);
console.log(`Games: ${selected.filter((a) => a.kind === "game").length}`);
