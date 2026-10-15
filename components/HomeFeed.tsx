import Link from "next/link";
import { AppIcon, Stars } from "@/components/AppIcon";
import { displayDownloads, displayRating, formatRating, type StoreApp } from "@/lib/catalog";

const browseCats = [
  { name: "Action", href: "/category/action", color: "#3b82f6", icon: "swords" },
  { name: "Adventure", href: "/category/rpg", color: "#22c55e", icon: "compass" },
  { name: "Racing", href: "/category/racing", color: "#ef4444", icon: "car" },
  { name: "Simulation", href: "/category/casual", color: "#f59e0b", icon: "city" },
  { name: "Puzzle", href: "/category/puzzle", color: "#8b5cf6", icon: "puzzle" },
  { name: "Strategy", href: "/category/puzzle", color: "#06b6d4", icon: "chess" },
  { name: "Sports", href: "/category/sports", color: "#f97316", icon: "ball" },
  { name: "Arcade", href: "/category/action", color: "#ec4899", icon: "pad" },
  { name: "Tools", href: "/category/tools", color: "#0ea5e9", icon: "wrench" },
  { name: "Entertainment", href: "/category/video", color: "#a855f7", icon: "plane" },
  { name: "Productivity", href: "/category/productivity", color: "#14b8a6", icon: "clip" },
  { name: "Personalization", href: "/tools", color: "#f43f5e", icon: "palette" },
  { name: "Social", href: "/category/social", color: "#6366f1", icon: "chat" },
  { name: "Photography", href: "/category/photography", color: "#84cc16", icon: "camera" },
  { name: "Music", href: "/category/music", color: "#e11d48", icon: "music" },
  { name: "More", href: "/apps", color: "#94a3b8", icon: "more" },
];

function CatGlyph({ icon }: { icon: string }) {
  const common = "h-6 w-6";
  switch (icon) {
    case "swords":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 19 9-9M10 4l10 10M8 16l-4 4M16 8l4-4" />
        </svg>
      );
    case "compass":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="m16 8-2.5 6.5L7 16l2.5-6.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "car":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 14v3h2.2a1.8 1.8 0 0 0 3.6 0h4.4a1.8 1.8 0 0 0 3.6 0H20v-3l-2-5H6z" />
          <path d="M7 9 8.5 6h7L17 9" />
        </svg>
      );
    case "city":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20V9h5v11M9 20V5h6v15M15 20v-7h5v7" />
        </svg>
      );
    case "puzzle":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 4h4v3a2 2 0 1 0 2 2h3v4h-3a2 2 0 1 0-2 2v3H9v-3a2 2 0 1 0-2-2H4V9h3a2 2 0 1 0 2-2z" />
        </svg>
      );
    case "chess":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 9 8h6zM8 8h8v3H8zM9 11h6l1 8H8z" />
        </svg>
      );
    case "ball":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4c2 2.5 3 5 3 8s-1 5.5-3 8M12 4c-2 2.5-3 5-3 8s1 5.5 3 8M4.5 10h15M4.5 14h15" />
        </svg>
      );
    case "pad":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor">
          <path d="M7 8h10a4.5 4.5 0 0 1 0 9H7A4.5 4.5 0 0 1 7 8zm2 2.5v1.5H7.5V14H6v-2H4.5v-1.5H6V9h1.5v1.5H9zm8.2.8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </svg>
      );
    case "wrench":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 7a4 4 0 0 1-5.6 3.7L4 15.1 6.9 18l4.4-4.4A4 4 0 1 1 14 7z" />
        </svg>
      );
    case "plane":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor">
          <path d="M21 11 4 4l2 7-2 7 17-7zm-9 0h7" />
        </svg>
      );
    case "clip":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="5" width="12" height="15" rx="1.5" />
          <path d="M9 5V4h6v1M8 10h8M8 14h6" />
        </svg>
      );
    case "palette":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4a8 8 0 1 0 0 16h1.5A2.5 2.5 0 0 0 16 17.5 2.5 2.5 0 0 1 18.5 15H19a8 8 0 0 0-7-11z" />
          <circle cx="8.5" cy="10" r="1" fill="currentColor" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
          <circle cx="15.5" cy="10" r="1" fill="currentColor" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 6h14v10H9l-4 3z" />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 8h3l1.5-2h5L16 8h3v10H5z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "music":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V6l10-2v12" />
          <circle cx="7" cy="18" r="2.5" />
          <circle cx="17" cy="16" r="2.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor">
          <circle cx="6" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="18" cy="12" r="1.6" />
        </svg>
      );
  }
}

const popularSearches = ["apk", "puzzle", "keyboard", "camera", "music", "notes"];

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <Link href={href} className="text-sm font-medium text-[#2f7bff] hover:underline">
        View All →
      </Link>
    </div>
  );
}

export function AppTile({ app }: { app: StoreApp }) {
  const rating = displayRating(app);
  const cover = app.screenshots?.[0] || app.iconUrl || `/api/shot/${app.slug}/0`;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <Link href={`/app/${app.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="h-full w-full object-cover" />
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-10 text-[15px] font-bold leading-5 text-slate-900">
          {app.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          v{app.version} • {app.size}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
          <span className="text-amber-400">★</span>
          {formatRating(rating)}
        </p>
      </Link>
      <a
        href={`/api/download/${app.slug}`}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#2f7bff] py-2.5 text-sm font-bold text-white hover:bg-[#2563eb]"
      >
        Download
      </a>
    </div>
  );
}

function AppGrid({ apps }: { apps: StoreApp[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {apps.map((app) => (
        <AppTile key={app.slug} app={app} />
      ))}
    </div>
  );
}

export function HomeFeed({
  latest,
  games,
  apps,
  trending,
  tools,
  recommended,
  newGames,
  hotGames,
}: {
  latest: StoreApp[];
  games: StoreApp[];
  apps: StoreApp[];
  trending: StoreApp[];
  tools: StoreApp[];
  recommended: StoreApp[];
  newGames: StoreApp[];
  hotGames: StoreApp[];
}) {
  return (
    <div className="bg-[#eef3f8] px-3 py-8 sm:px-4">
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <SectionTitle title="Browse by Categories" href="/apps" />
            <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-6 md:grid-cols-8">
              {browseCats.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: cat.color }}
                  >
                    <CatGlyph icon={cat.icon} />
                  </span>
                  <span className="text-center text-[12px] font-medium text-slate-600">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="Latest Updates" href="/updates" />
            <AppGrid apps={latest} />
          </section>

          <section>
            <SectionTitle title="Popular Games" href="/games" />
            <AppGrid apps={games} />
          </section>

          <section>
            <SectionTitle title="Popular Apps" href="/apps" />
            <AppGrid apps={apps} />
          </section>

          <section>
            <SectionTitle title="Recommended Tools" href="/tools" />
            <AppGrid apps={tools} />
          </section>

          <section>
            <SectionTitle title="New Games" href="/games" />
            <AppGrid apps={newGames} />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/games"
              className="relative min-h-[188px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#c026d3] text-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/promo/promo-games.jpg"
                alt=""
                className="absolute right-0 top-0 h-full w-[58%] object-cover object-[center_20%]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#6d28d9_0%,rgba(109,40,217,.88)_42%,rgba(109,40,217,.15)_68%,transparent_82%)]" />
              <div className="relative z-10 flex h-full max-w-[52%] flex-col justify-center p-6 md:p-7">
                <p className="text-2xl font-black">Best MOD Games</p>
                <p className="mt-1 text-sm leading-5 text-violet-100">
                  Unlock premium features and enjoy unlimited resources.
                </p>
                <span className="mt-4 inline-flex w-fit rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#6d28d9]">
                  Explore Now
                </span>
              </div>
            </Link>
            <Link
              href="/apps"
              className="relative min-h-[188px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/promo/promo-apps.jpg"
                alt=""
                className="absolute right-0 top-0 h-full w-[58%] object-cover object-[70%_center]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#0ea5e9_0%,rgba(14,165,233,.88)_40%,rgba(14,165,233,.12)_70%,transparent_85%)]" />
              <div className="relative z-10 flex h-full max-w-[52%] flex-col justify-center p-6 md:p-7">
                <p className="text-2xl font-black">Useful Android Apps</p>
                <p className="mt-1 text-sm leading-5 text-sky-50">
                  Productivity, entertainment, tools and more.
                </p>
                <span className="mt-4 inline-flex w-fit rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#0284c7]">
                  Explore Now
                </span>
              </div>
            </Link>
          </div>

          <section>
            <SectionTitle title="Editors' Choice" href="/updates" />
            <AppGrid apps={recommended} />
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-bold text-slate-900">Search Downloads</h3>
            <form action="/search" className="mt-3 flex overflow-hidden rounded-xl ring-1 ring-slate-200">
              <input
                name="q"
                placeholder="Search games or apps..."
                className="w-full px-3 py-2.5 text-sm outline-none"
              />
              <button type="submit" className="bg-[#2f7bff] px-3 text-white" aria-label="Search">
                ⌕
              </button>
            </form>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Popular Searches
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-[#2f7bff]"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Trending Downloads</h3>
              <Link href="/updates" className="text-xs font-medium text-[#2f7bff]">
                View All →
              </Link>
            </div>
            <ol className="space-y-3">
              {trending.map((app, i) => (
                <li key={app.slug}>
                  <Link href={`/app/${app.slug}`} className="flex items-center gap-3">
                    <span className="w-4 text-sm font-bold text-slate-400">{i + 1}</span>
                    <AppIcon app={app} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{app.name}</p>
                      <p className="text-xs text-slate-500">{displayDownloads(app)}</p>
                    </div>
                    <span className="text-[#2f7bff]">↓</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Top Rated Apps</h3>
              <Link href="/apps" className="text-xs font-medium text-[#2f7bff]">
                View All →
              </Link>
            </div>
            <ul className="space-y-3">
              {apps.slice(0, 5).map((app) => (
                <li key={app.slug}>
                  <Link href={`/app/${app.slug}`} className="flex items-center gap-3">
                    <AppIcon app={app} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{app.name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Stars rating={displayRating(app)} />
                        {formatRating(displayRating(app))}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Hot Games</h3>
              <Link href="/games" className="text-xs font-medium text-[#2f7bff]">
                View All →
              </Link>
            </div>
            <ul className="space-y-3">
              {hotGames.map((app) => (
                <li key={app.slug}>
                  <Link href={`/app/${app.slug}`} className="flex items-center gap-3">
                    <AppIcon app={app} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{app.name}</p>
                      <p className="text-xs text-slate-500">
                        ★ {formatRating(displayRating(app))} · {app.size}
                      </p>
                    </div>
                    <span className="text-[#2f7bff]">↓</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-bold text-slate-900">Quick Categories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {browseCats.slice(0, 10).map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-[#2f7bff]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#0b1b33] p-5 text-white">
            <h3 className="font-bold">Stay Updated</h3>
            <p className="mt-2 text-sm text-slate-300">
              Get the latest open-source apps and games from the catalog.
            </p>
            <form className="mt-4 space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/15 placeholder:text-slate-400"
              />
              <button
                type="button"
                className="w-full rounded-lg bg-[#2f7bff] py-2 text-sm font-bold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
