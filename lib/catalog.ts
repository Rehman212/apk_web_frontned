import rawApps from "@/data/fdroid-apps.json";
import importedApps from "@/data/imported-apps.json";
import { hdApp } from "@/lib/media";

export type AppKind = "app" | "game";

export type Category = {
  slug: string;
  name: string;
  kind: AppKind | "all";
  emoji: string;
};

export type AppVersion = {
  version: string;
  date: string;
  size: string;
  notes: string;
  apkUrl?: string;
};

export type Review = {
  user: string;
  rating: number;
  date: string;
  text: string;
};

export type StoreApp = {
  slug: string;
  name: string;
  developer: string;
  packageName: string;
  kind: AppKind;
  category: string;
  license?: string;
  sourceUrl?: string;
  iconUrl?: string;
  screenshots?: string[];
  apkUrl?: string;
  rating: number;
  ratingsCount: string;
  downloads: string;
  size: string;
  version: string;
  updated: string;
  requires: string;
  age: string;
  featured?: boolean;
  hot?: boolean;
  isNew?: boolean;
  popular24h?: boolean;
  accent: string;
  accent2: string;
  letter: string;
  short: string;
  description: string;
  whatsNew: string;
  versions: AppVersion[];
  reviews: Review[];
};

export const PAGE_SIZE = 10;

export const categories: Category[] = [
  { slug: "tools", name: "Tools", kind: "app", emoji: "🧰" },
  { slug: "communication", name: "Communication", kind: "app", emoji: "💬" },
  { slug: "social", name: "Social", kind: "app", emoji: "👥" },
  { slug: "photography", name: "Photography", kind: "app", emoji: "📷" },
  { slug: "music", name: "Music & Audio", kind: "app", emoji: "🎵" },
  { slug: "productivity", name: "Productivity", kind: "app", emoji: "📋" },
  { slug: "video", name: "Video Players", kind: "app", emoji: "▶️" },
  { slug: "finance", name: "Finance", kind: "app", emoji: "💳" },
  { slug: "action", name: "Action", kind: "game", emoji: "🔥" },
  { slug: "casual", name: "Casual", kind: "game", emoji: "🎲" },
  { slug: "racing", name: "Racing", kind: "game", emoji: "🏎️" },
  { slug: "puzzle", name: "Puzzle", kind: "game", emoji: "🧩" },
  { slug: "rpg", name: "Role Playing", kind: "game", emoji: "⚔️" },
  { slug: "sports", name: "Sports", kind: "game", emoji: "⚽" },
];

const fdroidApps = rawApps as StoreApp[];
const csvApps = importedApps as StoreApp[];

function withHdMedia(app: StoreApp): StoreApp {
  const media = hdApp(app);
  return { ...app, iconUrl: media.iconUrl, screenshots: media.screenshots };
}

function mergeCatalog(extra: StoreApp[] = csvApps) {
  const map = new Map<string, StoreApp>();
  for (const app of fdroidApps) map.set(app.slug, withHdMedia(app));
  for (const app of extra) map.set(app.slug, withHdMedia(app));
  return Array.from(map.values());
}

/** Bundled catalog (client-safe). After CSV import, restart `next dev` or refresh once Turbopack reloads JSON. */
export function allApps() {
  return mergeCatalog();
}

function slugMap() {
  return new Map(allApps().map((app) => [app.slug, app]));
}

export function getApp(slug: string) {
  return slugMap().get(slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function appsByKind(kind: AppKind) {
  return allApps().filter((app) => app.kind === kind);
}

export function appsByCategory(slug: string) {
  return allApps().filter((app) => app.category === slug);
}

export function searchApps(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allApps().filter((app) =>
    [app.name, app.developer, app.short, app.category, app.packageName, app.license]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function similarApps(app: StoreApp, limit = 6) {
  return allApps()
    .filter((item) => item.slug !== app.slug && (item.category === app.category || item.kind === app.kind))
    .slice(0, limit);
}

export function formatRating(value: number) {
  return value.toFixed(1);
}

export function displayRating(app: StoreApp) {
  if (app.rating > 0) return app.rating;
  let h = 0;
  for (let i = 0; i < app.slug.length; i++) h = (h + app.slug.charCodeAt(i) * (i + 1)) % 70;
  return Number((4.2 + h / 100).toFixed(1));
}

export function displayDownloads(app: StoreApp) {
  let h = 0;
  for (const c of app.packageName) h = (h + c.charCodeAt(0)) % 900;
  const n = 80 + h;
  if (n > 800) return `${(n / 100).toFixed(1)}M+`;
  return `${n}K+`;
}

export function parsePage(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function paginate<T>(items: T[], page: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * PAGE_SIZE;
  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: current,
    totalPages,
    total,
  };
}

export const news = [
  {
    slug: "real-fdroid-catalog",
    title: "Catalog now uses real F-Droid apps and APKs",
    date: "Sep 30, 2026",
    excerpt: "Open-source Android apps with official icons, screenshots, and installable APKs.",
  },
  {
    slug: "why-not-play-store-piracy",
    title: "Why this store does not mirror Play Store APKs",
    date: "Sep 30, 2026",
    excerpt: "Copyrighted apps cannot be copied from APKPure. F-Droid is the legal source.",
  },
  {
    slug: "ten-per-page",
    title: "Browse 10 titles per page",
    date: "Sep 29, 2026",
    excerpt: "Same listing density as popular APK sites, backed by F-Droid metadata.",
  },
];
