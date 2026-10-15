import { getApp } from "@/lib/catalog";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const app = getApp(slug);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  const url = new URL(request.url);
  const version = url.searchParams.get("v");
  const match = version
    ? app.versions.find((item) => item.version === version)
    : app.versions[0];
  const apkUrl = match?.apkUrl || app.apkUrl;
  if (!apkUrl) {
    return new Response("APK not available", { status: 404 });
  }

  const upstream = await fetch(apkUrl, { redirect: "follow" });
  if (!upstream.ok || !upstream.body) {
    return Response.redirect(apkUrl, 302);
  }

  const filename = `${app.packageName}-${match?.version || app.version}.apk`;
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
