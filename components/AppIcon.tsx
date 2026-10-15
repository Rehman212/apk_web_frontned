import type { StoreApp } from "@/lib/catalog";

export function AppIcon({
  app,
  size = 72,
}: {
  app: Pick<StoreApp, "slug" | "name" | "letter" | "iconUrl">;
  size?: number;
}) {
  const src = app.iconUrl || `/api/icon/${app.slug}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${app.name} icon`}
      width={size}
      height={size}
      className="shrink-0 rounded-[22%] bg-zinc-100 object-cover shadow-sm"
    />
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i < full ? "currentColor" : "#e5e7eb"}>
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 16.71l.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
