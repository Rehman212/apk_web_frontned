import { apiBase } from "@/lib/apiBase";
import { allApps, type StoreApp } from "@/lib/catalog";
import { dbApkToStoreApp, type DbApkRow } from "@/lib/dbApk";
import { HOME_SECTIONS } from "@/lib/homeSections";

export async function loadHomeFeed() {
  const catalog = allApps();
  const games = catalog.filter((a) => a.kind === "game");
  const fallback = {
    latest: catalog.slice(0, 6),
    games: games.slice(0, 6),
    apps: catalog.filter((a) => a.kind === "app").slice(0, 6),
    trending: catalog.slice(6, 12),
    tools: catalog.filter((a) => a.category === "tools").slice(0, 6),
    recommended: catalog.slice(18, 24),
    newGames: games.slice(6, 12),
    hotGames: games.slice(12, 18),
  };

  try {
    const res = await fetch(`${apiBase()}/api/apps/home`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as {
      apps?: Record<string, DbApkRow[]>;
    };
    const by = data.apps || {};

    const pick = (slug: string, fb: StoreApp[]) => {
      const rows = by[slug] || [];
      if (!rows.length) return fb;
      return rows.map(dbApkToStoreApp);
    };

    return {
      latest: pick("latest-updates", fallback.latest),
      games: pick("popular-games", fallback.games),
      apps: pick("popular-apps", fallback.apps),
      tools: pick("recommended-tools", fallback.tools),
      newGames: pick("new-games", fallback.newGames),
      recommended: pick("editors-choice", fallback.recommended),
      trending: fallback.trending,
      hotGames: fallback.hotGames,
      sectionLabels: HOME_SECTIONS,
    };
  } catch {
    return fallback;
  }
}
