import type { StoreApp } from "@/lib/catalog";
import { hdApp } from "@/lib/media";

export type DbApkRow = {
  id?: string;
  slug: string;
  name: string;
  packageName: string;
  developer?: string;
  kind?: string;
  category?: string;
  homeSection?: string;
  version?: string;
  size?: string;
  apkUrl?: string | null;
  iconUrl?: string | null;
  short?: string;
  description?: string;
  requires?: string;
  letter?: string;
  accent?: string;
  payload?: Partial<StoreApp> | null;
};

export function dbApkToStoreApp(row: DbApkRow): StoreApp {
  if (row.payload && typeof row.payload === "object" && row.payload.slug) {
    const payload = row.payload as StoreApp;
    const media = hdApp({
      iconUrl: row.iconUrl || payload.iconUrl,
      screenshots: payload.screenshots,
    });
    const accent = row.accent || payload.accent || "#2f7bff";
    return {
      ...payload,
      slug: row.slug,
      name: row.name,
      packageName: row.packageName,
      developer: row.developer || payload.developer,
      kind: (row.kind === "game" || payload.kind === "game" ? "game" : "app") as StoreApp["kind"],
      category: row.category || payload.category,
      version: row.version || payload.version,
      size: row.size || payload.size,
      requires: row.requires || payload.requires,
      short: row.short ?? payload.short,
      description: row.description ?? payload.description,
      letter: row.letter || payload.letter,
      accent,
      accent2: payload.accent2 || accent,
      apkUrl: row.apkUrl || payload.apkUrl,
      iconUrl: media.iconUrl,
      screenshots: media.screenshots,
    };
  }

  const accent = row.accent || "#2f7bff";
  const today = new Date().toISOString().slice(0, 10);
  return {
    slug: row.slug,
    name: row.name,
    developer: row.developer || "Unknown",
    packageName: row.packageName,
    kind: row.kind === "game" ? "game" : "app",
    category: row.homeSection || row.category || "tools",
    iconUrl: hdApp({ iconUrl: row.iconUrl || undefined }).iconUrl,
    apkUrl: row.apkUrl || undefined,
    rating: 0,
    ratingsCount: "0",
    downloads: "0",
    size: row.size || "—",
    version: row.version || "1.0.0",
    updated: today,
    requires: row.requires || "Android 8.0+",
    age: "Everyone",
    isNew: true,
    accent,
    accent2: accent,
    letter: (row.letter || row.name).slice(0, 2).toUpperCase(),
    short: row.short || row.name,
    description: row.description || row.short || row.name,
    whatsNew: `Version ${row.version || "1.0.0"}`,
    versions: [
      {
        version: row.version || "1.0.0",
        date: today,
        size: row.size || "—",
        notes: "From catalog DB",
        apkUrl: row.apkUrl || undefined,
      },
    ],
    reviews: [],
  };
}
