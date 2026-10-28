import { promoShotSvg } from "@/lib/art";
import { getApp } from "@/lib/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; n: string }> },
) {
  const { slug, n } = await context.params;
  const app = getApp(slug);
  if (!app) return new Response("Not found", { status: 404 });
  return new Response(promoShotSvg(app, Number(n) || 0), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
