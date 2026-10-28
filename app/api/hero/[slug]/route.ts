import { heroBannerSvg } from "@/lib/art";
import { getApp } from "@/lib/catalog";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const app = getApp(slug);
  if (!app) return new Response("Not found", { status: 404 });
  return new Response(heroBannerSvg(app), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
