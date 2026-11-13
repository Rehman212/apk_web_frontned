export type ScrapedApp = {
  app_name?: string;
  name?: string;
  package_name?: string;
  packageName?: string;
  version?: string;
  developer?: string;
  category?: string;
  file_size?: string;
  size?: string;
  minimum_android?: string;
  requires?: string;
  url?: string;
  download_page_links?: string[];
  apkUrl?: string;
  icon?: string;
  iconUrl?: string;
  description?: string;
};

function csvEscape(value: unknown) {
  let text =
    typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

function slugFrom(app: ScrapedApp) {
  const url = app.url || app.apkUrl || "";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const sub = host.replace(/\.androidapks\.com$/i, "");
    if (sub && sub !== "androidapks.com") {
      return sub.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    }
    const path = new URL(url).pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
    if (path) return path.toLowerCase();
  } catch {
    /* ignore */
  }
  const name = app.app_name || app.name || "app";
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function scrapedAppsToCsv(apps: ScrapedApp[]) {
  const headers = [
    "name",
    "packageName",
    "version",
    "developer",
    "kind",
    "category",
    "size",
    "apkUrl",
    "iconUrl",
    "short",
    "description",
    "requires",
    "slug",
  ];
  const lines = [headers.join(",")];
  const used = new Set<string>();
  apps.forEach((app, i) => {
    let slug = slugFrom(app) || `app-${i + 1}`;
    if (used.has(slug)) slug = `${slug}-${i + 1}`;
    used.add(slug);
    const name = app.app_name || app.name || slug;
    const pkg =
      (app.package_name || app.packageName || "").trim() ||
      `com.apk.${slug.replace(/-/g, "") || "app"}${i + 1}`;
    const description = String(app.description || "").slice(0, 20000);
    const apkUrl = app.download_page_links?.[0] || app.apkUrl || app.url || "";
    const kind = /game/i.test(app.category || "") ? "game" : "app";
    lines.push(
      [
        name,
        pkg,
        app.version || "1.0.0",
        app.developer || "Unknown",
        kind,
        app.category || "tools",
        app.file_size || app.size || "—",
        apkUrl,
        app.icon || app.iconUrl || "",
        description.slice(0, 160),
        description,
        app.minimum_android || app.requires || "Android 8.0+",
        slug,
      ]
        .map(csvEscape)
        .join(","),
    );
  });
  return `\uFEFF${lines.join("\n")}`;
}
