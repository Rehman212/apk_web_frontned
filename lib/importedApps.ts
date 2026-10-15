import { promises as fs } from "fs";
import path from "path";
import type { StoreApp } from "@/lib/catalog";

const FILE = path.join(process.cwd(), "data", "imported-apps.json");

export async function readImportedApps(): Promise<StoreApp[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(raw) as StoreApp[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeImportedApps(apps: StoreApp[]) {
  await fs.writeFile(FILE, `${JSON.stringify(apps, null, 2)}\n`, "utf8");
}

export async function upsertImportedApp(app: StoreApp) {
  const apps = await readImportedApps();
  const idx = apps.findIndex((item) => item.slug === app.slug || item.packageName === app.packageName);
  if (idx >= 0) apps[idx] = app;
  else apps.unshift(app);
  await writeImportedApps(apps);
  return apps;
}
