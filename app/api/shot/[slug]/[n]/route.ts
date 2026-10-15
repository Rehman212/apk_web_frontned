import { screenshotSvg } from "@/lib/art";
import { getApp } from "@/lib/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; n: string }> },
) {
  const { slug, n } = await context.params;
  const app = getApp(slug);
  if (!app) return new Response("Not found", { status: 404 });
  const frame = Number(n) || 0;
  return new Response(screenshotSvg(app, frame), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
