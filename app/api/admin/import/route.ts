import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { apiBase } from "@/lib/apiBase";
import type { StoreApp } from "@/lib/catalog";
import { readImportedApps, upsertImportedApp } from "@/lib/importedApps";

async function requireAdmin(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const res = await fetch(`${apiBase()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return { token };
}

const HOME_SLUGS = [
  "latest-updates",
  "popular-games",
  "popular-apps",
  "recommended-tools",
  "new-games",
  "editors-choice",
];

function toDbPayload(app: StoreApp) {
  const homeSection = HOME_SLUGS[Math.floor(Math.random() * HOME_SLUGS.length)];
  return {
    slug: app.slug,
    name: app.name,
    packageName: app.packageName,
    developer: app.developer,
    kind: app.kind,
    category: app.category,
    homeSection,
    version: app.version,
    size: app.size,
    apkUrl: app.apkUrl,
    iconUrl: app.iconUrl,
    short: (app.short || "").slice(0, 300),
    description: (app.description || "").slice(0, 20000),
    requires: app.requires,
    accent: app.accent,
    letter: app.letter,
    payload: {
      slug: app.slug,
      screenshots: app.screenshots?.slice(0, 8) || [],
      whatsNew: app.whatsNew,
      versions: app.versions?.slice(0, 3) || [],
    } as Record<string, unknown>,
  };
}

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${apiBase()}/api/apps`, {
      headers: { Authorization: `Bearer ${admin.token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { apps?: unknown[]; count?: number };
      return NextResponse.json({ apps: data.apps ?? [], count: data.count ?? 0, source: "db" });
    }
  } catch {
    /* fallback below */
  }

  const apps = await readImportedApps();
  return NextResponse.json({ apps, count: apps.length, source: "json" });
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { app?: StoreApp } | null;
  const app = body?.app;
  if (!app?.name || !app?.slug || !app?.packageName) {
    return NextResponse.json({ message: "Invalid APK payload." }, { status: 400 });
  }

  let dbCount: number | undefined;
  let dbError: string | undefined;

  try {
    const res = await fetch(`${apiBase()}/api/apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify(toDbPayload(app)),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string | string[]; count?: number };
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message[0] : data.message;
      dbError = msg || "DB save failed";
    } else {
      dbCount = data.count;
    }
  } catch {
    dbError = "Cannot reach backend DB API on port 4000.";
  }

  if (dbError) {
    return NextResponse.json({ message: dbError }, { status: 502 });
  }

  try {
    await upsertImportedApp(app);
  } catch {
    /* Vercel filesystem is read-only — DB is source of truth */
  }
  revalidatePath("/");
  revalidatePath("/apps");
  revalidatePath("/games");
  revalidatePath(`/app/${app.slug}`);

  return NextResponse.json({
    ok: true,
    app,
    count: dbCount ?? 0,
    savedTo: "db",
  });
}
