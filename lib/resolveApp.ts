import { apiBase } from "@/lib/apiBase";
import { getApp, type StoreApp } from "@/lib/catalog";
import { dbApkToStoreApp, type DbApkRow } from "@/lib/dbApk";

/** Prefer live DB product; fall back to bundled catalog. */
export async function resolveApp(slug: string): Promise<StoreApp | undefined> {
  try {
    const res = await fetch(
      `${apiBase()}/api/apps/by-slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 10 } },
    );
    if (res.ok) {
      const data = (await res.json()) as { app?: DbApkRow };
      if (data.app?.slug) return dbApkToStoreApp(data.app);
    }
  } catch {
    /* fall through */
  }
  return getApp(slug);
}
