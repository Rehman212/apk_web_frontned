import { iconSvg } from "@/lib/art";
import { getApp } from "@/lib/catalog";
import { hdMediaUrl } from "@/lib/media";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const app = getApp(slug);
  if (!app) return new Response("Not found", { status: 404 });
  if (app.iconUrl) {
    return Response.redirect(hdMediaUrl(app.iconUrl, 512) || app.iconUrl, 302);
  }
  return new Response(iconSvg(app), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
