import type { AppKind, StoreApp } from "@/lib/catalog";
import { hdMediaUrl } from "@/lib/media";

export type CsvApkDraft = {
  row: number;
  name: string;
  packageName: string;
  version: string;
  developer: string;
  kind: AppKind;
  category: string;
  size: string;
  apkUrl: string;
  iconUrl: string;
  short: string;
  description: string;
  requires: string;
  slug: string;
};

const HEADER_ALIASES: Record<string, keyof CsvApkDraft | "ignore"> = {
  name: "name",
  title: "name",
  app: "name",
  app_name: "name",
  appname: "name",
  package: "packageName",
  packagename: "packageName",
  package_name: "packageName",
  pkg: "packageName",
  version: "version",
  ver: "version",
  developer: "developer",
  author: "developer",
  publisher: "developer",
  kind: "kind",
  type: "kind",
  category: "category",
  cat: "category",
  size: "size",
  apk: "apkUrl",
  apkurl: "apkUrl",
  apk_url: "apkUrl",
  download: "apkUrl",
  downloadurl: "apkUrl",
  download_url: "apkUrl",
  url: "apkUrl",
  icon: "iconUrl",
  iconurl: "iconUrl",
  icon_url: "iconUrl",
  short: "short",
  summary: "short",
  description: "description",
  desc: "description",
  requires: "requires",
  android: "requires",
  slug: "slug",
};

export const CSV_TEMPLATE = `name,packageName,version,developer,kind,category,size,apkUrl,iconUrl,short,description,requires
Block Puzzle Demo,com.example.blockpuzzle,1.0.0,Demo Studio,game,puzzle,12 MB,https://example.com/app.apk,,Fun block puzzle,A sample row for CSV import testing,Android 8.0+
Notes Tool Demo,com.example.notes,2.1.0,Demo Labs,app,tools,4 MB,https://example.com/notes.apk,,Simple notes,A second sample row,Android 7.0+
`;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

function pickKind(raw: string): AppKind {
  const v = raw.trim().toLowerCase();
  if (v === "game" || v === "games" || v === "g") return "game";
  return "app";
}

export function parseApkCsv(text: string): { drafts: CsvApkDraft[]; error?: string } {
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) {
    return { drafts: [], error: "CSV needs a header row and at least one APK row." };
  }

  const headers = rows[0].map(normalizeHeader);
  const mapped = headers.map((h) => HEADER_ALIASES[h] ?? null);
  if (!mapped.includes("name") && !mapped.includes("packageName")) {
    return { drafts: [], error: "CSV must include a name or packageName column." };
  }

  const drafts: CsvApkDraft[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const draft: CsvApkDraft = {
      row: i,
      name: "",
      packageName: "",
      version: "1.0.0",
      developer: "Unknown",
      kind: "app",
      category: "tools",
      size: "—",
      apkUrl: "",
      iconUrl: "",
      short: "",
      description: "",
      requires: "Android 8.0+",
      slug: "",
    };

    mapped.forEach((key, idx) => {
      if (!key || key === "ignore") return;
      const raw = (values[idx] ?? "").trim();
      if (!raw) return;
      if (key === "kind") draft.kind = pickKind(raw);
      else draft[key] = raw as never;
    });

    if (!draft.name && draft.packageName) draft.name = draft.packageName;
    if (!draft.packageName && draft.name) {
      draft.packageName = `com.imported.${slugify(draft.name).replace(/-/g, "") || "app"}`;
    }
    if (!draft.slug) {
      draft.slug = slugify(draft.packageName || draft.name) || `import-${i}`;
    }
    if (!draft.short) draft.short = draft.description.slice(0, 120) || `${draft.name} APK`;
    if (!draft.description) draft.description = draft.short;
    if (!draft.name) continue;
    drafts.push(draft);
  }

  if (!drafts.length) return { drafts: [], error: "No valid APK rows found in this CSV." };
  return { drafts };
}

const ACCENTS = ["#2f7bff", "#15c15d", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export function draftToStoreApp(draft: CsvApkDraft): StoreApp {
  const accent = ACCENTS[Math.abs(hash(draft.slug)) % ACCENTS.length];
  const letter = draft.name.slice(0, 2).toUpperCase();
  const today = new Date().toISOString().slice(0, 10);
  return {
    slug: draft.slug,
    name: draft.name,
    developer: draft.developer,
    packageName: draft.packageName,
    kind: draft.kind,
    category: draft.category || "tools",
    iconUrl: hdMediaUrl(draft.iconUrl, 512) || draft.iconUrl || undefined,
    apkUrl: draft.apkUrl || undefined,
    rating: 0,
    ratingsCount: "0",
    downloads: "0",
    size: draft.size || "—",
    version: draft.version || "1.0.0",
    updated: today,
    requires: draft.requires || "Android 8.0+",
    age: "Everyone",
    isNew: true,
    accent,
    accent2: accent,
    letter,
    short: draft.short,
    description: draft.description,
    whatsNew: `Imported ${draft.version}`,
    versions: [
      {
        version: draft.version || "1.0.0",
        date: today,
        size: draft.size || "—",
        notes: "Imported from CSV",
        apkUrl: draft.apkUrl || undefined,
      },
    ],
    reviews: [],
  };
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return h;
}
