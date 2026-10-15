import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import type { StoreApp } from "@/lib/catalog";

export function AppCard({ app }: { app: StoreApp }) {
  return (
    <Link
      href={`/app/${app.slug}`}
      className="group flex w-[148px] shrink-0 flex-col gap-2 rounded-xl p-2 hover:bg-zinc-50"
    >
      <AppIcon app={app} size={72} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-900 group-hover:text-[#0ea24a]">
          {app.name}
        </p>
        <p className="truncate text-xs text-zinc-500">{app.developer}</p>
        <p className="mt-1 truncate text-xs text-zinc-500">{app.license || "Open source"}</p>
      </div>
    </Link>
  );
}

export function AppRow({ app }: { app: StoreApp }) {
  return (
    <Link
      href={`/app/${app.slug}`}
      className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 hover:border-[#15c15d]/40 hover:shadow-sm"
    >
      <AppIcon app={app} size={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-zinc-900">{app.name}</p>
        <p className="truncate text-sm text-zinc-500">{app.short}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
          <span>{app.license || "Open source"}</span>
          <span>{app.size}</span>
          <span>{app.version}</span>
        </div>
      </div>
      <span className="hidden rounded-full bg-[#15c15d] px-4 py-2 text-sm font-semibold text-white sm:inline">
        Download
      </span>
    </Link>
  );
}

export function AppRail({ title, href, apps }: { title: string; href?: string; apps: StoreApp[] }) {
  if (!apps.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">{title}</h2>
        {href ? (
          <Link href={href} className="text-sm font-medium text-[#0ea24a] hover:underline">
            More
          </Link>
        ) : null}
      </div>
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-2">
        {apps.map((app) => (
          <AppCard key={app.slug} app={app} />
        ))}
      </div>
    </section>
  );
}
