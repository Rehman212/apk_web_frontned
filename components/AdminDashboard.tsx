"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ApkScraperTool } from "@/components/ApkScraperTool";
import { CategoriesPanel } from "@/components/CategoriesPanel";
import { CsvImportTool } from "@/components/CsvImportTool";
import { DbToolsList } from "@/components/DbToolsList";
import { apiBase } from "@/lib/apiBase";

export type CatalogSnapshot = {
  catalog: number;
  games: number;
  applications: number;
  categories: number;
  featured: number;
  hot: number;
  isNew: number;
  withApk: number;
  withIcon: number;
  withShots: number;
  apkCoverage: number;
  iconCoverage: number;
  shotCoverage: number;
  byCategory: { slug: string; name: string; emoji: string; kind: string; count: number }[];
  weekBars: { label: string; value: number }[];
  top: {
    slug: string;
    name: string;
    kind: string;
    category: string;
    categoryName: string;
    version: string;
    developer: string;
    letter: string;
    accent: string;
    hasApk: boolean;
    featured: boolean;
  }[];
};

type AdminUser = { id: string; name: string; email: string; role: string };
type Section = "overview" | "tools-all" | "tools-scraper" | "tools-csv" | "tools-categories";

function token() {
  return window.localStorage.getItem("modplays-token") || window.sessionStorage.getItem("modplays-token") || "";
}

const NAV: { id: Section; label: string; icon: ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V5M4 19h16M8 16V9m4 7V7m4 9v-4" />
      </svg>
    ),
  },
];

const TOOL_ITEMS: { id: Section; label: string }[] = [
  { id: "tools-all", label: "ALL Tools" },
  { id: "tools-categories", label: "Categories" },
  { id: "tools-csv", label: "Upload CSV" },
  { id: "tools-scraper", label: "Get APK Scraper" },
];

export function AdminDashboard({ catalog }: { catalog: CatalogSnapshot }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [now] = useState(() => new Date());
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [liveApps, setLiveApps] = useState<number | null>(null);
  const [liveGames, setLiveGames] = useState<number | null>(null);

  const toolsActive =
    section === "tools-all" ||
    section === "tools-scraper" ||
    section === "tools-csv" ||
    section === "tools-categories";

  useEffect(() => {
    const api = apiBase();
    const t = token();
    if (!t) {
      router.replace("/login");
      return;
    }
    async function load() {
      try {
        const headers = { Authorization: `Bearer ${t}` };
        const meRes = await fetch(`${api}/api/auth/me`, { headers });
        if (!meRes.ok) {
          router.replace("/login");
          return;
        }
        setUser((await meRes.json()) as AdminUser);
        const statsRes = await fetch(`${api}/api/apps/stats`, { headers });
        if (statsRes.ok) {
          const stats = (await statsRes.json()) as {
            count?: number;
            applications?: number;
            games?: number;
          };
          if (typeof stats.count === "number") setLiveCount(stats.count);
          if (typeof stats.applications === "number") setLiveApps(stats.applications);
          if (typeof stats.games === "number") setLiveGames(stats.games);
        }
      } catch {
        setError("Cannot reach the API. Start the Nest backend on port 4000.");
      }
    }
    void load();
  }, [router]);

  function logout() {
    window.localStorage.removeItem("modplays-user");
    window.localStorage.removeItem("modplays-token");
    window.sessionStorage.removeItem("modplays-user");
    window.sessionStorage.removeItem("modplays-token");
    window.dispatchEvent(new Event("modplays-auth"));
    router.replace("/login");
  }

  const maxBar = Math.max(...catalog.weekBars.map((b) => b.value), 1);
  const maxCat = Math.max(...catalog.byCategory.map((c) => c.count), 1);
  const totalPackages = liveCount ?? catalog.catalog;
  const totalApps = liveApps ?? catalog.applications;
  const totalGames = liveGames ?? catalog.games;
  const gameShare = Math.round((totalGames / Math.max(totalPackages, 1)) * 100);
  const appShare = 100 - gameShare;

  if (!user && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f14] text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  const kpis = [
    { label: "Total catalog", value: totalPackages.toLocaleString(), meta: liveCount != null ? "From database" : "Bundled catalog" },
    { label: "Applications", value: totalApps.toLocaleString(), meta: `${appShare}% of catalog` },
    { label: "Games", value: totalGames.toLocaleString(), meta: `${gameShare}% of catalog` },
    { label: "APK coverage", value: `${catalog.apkCoverage}%`, meta: `${catalog.withApk.toLocaleString()} ready` },
  ];

  const activity = [
    { title: "Catalog synced", detail: `${totalPackages.toLocaleString()} titles`, time: "Now" },
    { title: "Admin signed in", detail: user?.email ?? "—", time: "Today" },
    { title: "Signup locked", detail: "Admin-only access", time: "Policy" },
    { title: "Media coverage", detail: `${catalog.iconCoverage}% icons`, time: "Live" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-200">
      <div className="flex min-h-screen">
        <aside className="hidden w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0e131a] lg:flex">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2f7bff] text-[11px] font-semibold text-white">
              M
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-tight text-white">ModPlays</p>
              <p className="text-[10px] text-slate-500">Admin</p>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="rounded-lg border border-white/[0.06] bg-[#121820] px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
              <p className="mt-1 text-[12px] text-slate-300">{totalPackages.toLocaleString()} packages</p>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 px-2">
            {NAV.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition ${
                    active ? "bg-white/[0.08] font-medium text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  <span className={active ? "text-[#7eb6ff]" : "text-slate-500"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setToolsOpen((v) => !v);
                  if (!toolsActive) setSection("tools-all");
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 hover:text-slate-300"
              >
                <span className="flex-1">Tools</span>
                <span className={`text-[9px] ${toolsOpen ? "rotate-180" : ""}`}>▾</span>
              </button>
              {toolsOpen ? (
                <div className="mt-0.5 space-y-0.5">
                  {TOOL_ITEMS.map((item) => {
                    const active = section === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSection(item.id)}
                        className={`w-full rounded-md px-2.5 py-1.5 pl-8 text-left text-[13px] transition ${
                          active ? "bg-white/[0.08] font-medium text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </nav>

          <div className="space-y-1 border-t border-white/[0.06] p-3">
            <Link href="/" className="block rounded-md px-2.5 py-1.5 text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200">
              Open storefront
            </Link>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-md px-2.5 py-1.5 text-left text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-rose-300"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0b0f14]/95 backdrop-blur">
            <div className="flex h-12 items-center gap-3 px-4 lg:px-6">
              <button type="button" className="rounded-md border border-white/10 p-1.5 lg:hidden" onClick={() => setMobileNav((v) => !v)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 7h14M5 12h14M5 17h10" />
                </svg>
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/[0.06] bg-[#121820] px-2.5 py-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.2-3.2" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-500"
                />
              </div>

              <span className="hidden text-[12px] text-slate-500 md:inline">
                {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <Link href="/apps" className="hidden rounded-md bg-[#2f7bff] px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#2563eb] md:inline">
                Store
              </Link>
              <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-[#121820] py-1 pl-1 pr-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[#2f7bff]/20 text-[11px] font-medium text-[#9ec5ff]">
                  {(user?.name ?? "Y").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate text-[12px] text-slate-300 sm:inline">{user?.name}</span>
              </div>
            </div>

            {mobileNav ? (
              <div className="space-y-1 border-t border-white/[0.06] px-3 py-2 lg:hidden">
                {[...NAV, ...TOOL_ITEMS].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSection(item.id);
                      setMobileNav(false);
                    }}
                    className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] ${
                      section === item.id ? "bg-white/[0.08] text-white" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </header>

          {error ? (
            <p className="mx-4 mt-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200 lg:mx-6">
              {error}
            </p>
          ) : null}

          <div className="flex-1 space-y-4 p-4 lg:p-6">
            {section === "overview" ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h1 className="text-[15px] font-semibold text-white">Overview</h1>
                    <p className="text-[12px] text-slate-500">Catalog metrics and recent activity</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSection("tools-csv")}
                      className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
                    >
                      Upload CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection("tools-all")}
                      className="rounded-md bg-white/[0.08] px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-white/[0.12]"
                    >
                      Tools
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {kpis.map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border border-white/[0.06] bg-[#121820] px-3.5 py-3">
                      <p className="text-[11px] text-slate-500">{kpi.label}</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight text-white">{kpi.value}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{kpi.meta}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 xl:grid-cols-3">
                  <section className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5 xl:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-[13px] font-medium text-white">Catalog velocity</h2>
                        <p className="text-[11px] text-slate-500">Indexed volume by week</p>
                      </div>
                      <span className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">12 weeks</span>
                    </div>
                    <div className="mt-4 flex h-28 items-end gap-1.5">
                      {catalog.weekBars.map((bar) => (
                        <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
                          <div className="flex w-full flex-1 items-end">
                            <div
                              className="w-full rounded-sm bg-[#2f7bff]/80"
                              style={{ height: `${Math.max(6, (bar.value / maxBar) * 100)}%` }}
                              title={String(bar.value)}
                            />
                          </div>
                          <span className="text-[9px] text-slate-600">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5">
                    <h2 className="text-[13px] font-medium text-white">Content mix</h2>
                    <p className="text-[11px] text-slate-500">Apps vs games</p>
                    <div className="mt-3 flex items-center gap-4">
                      <Donut app={appShare} game={gameShare} />
                      <div className="space-y-2 text-[12px]">
                        <LegendRow color="bg-[#2f7bff]" label="Apps" value={`${appShare}%`} />
                        <LegendRow color="bg-violet-400" label="Games" value={`${gameShare}%`} />
                        <LegendRow color="bg-emerald-400" label="Featured" value={String(catalog.featured)} />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="grid gap-3 lg:grid-cols-5">
                  <section className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5 lg:col-span-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-[13px] font-medium text-white">Top categories</h2>
                      <Link href="/apps" className="text-[11px] text-[#7eb6ff] hover:underline">
                        View store
                      </Link>
                    </div>
                    <div className="space-y-2.5">
                      {catalog.byCategory.slice(0, 6).map((cat) => (
                        <div key={cat.slug}>
                          <div className="mb-1 flex items-center justify-between text-[12px]">
                            <span className="text-slate-300">{cat.name}</span>
                            <span className="tabular-nums text-slate-500">{cat.count}</span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-[#2f7bff]/70"
                              style={{ width: `${(cat.count / maxCat) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5 lg:col-span-2">
                    <h2 className="mb-3 text-[13px] font-medium text-white">Activity</h2>
                    <ul className="space-y-2.5">
                      {activity.map((item) => (
                        <li key={item.title} className="flex gap-2.5 border-b border-white/[0.04] pb-2.5 last:border-0 last:pb-0">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7bff]" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[12px] font-medium text-slate-200">{item.title}</p>
                              <span className="shrink-0 text-[10px] text-slate-600">{item.time}</span>
                            </div>
                            <p className="truncate text-[11px] text-slate-500">{item.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#121820]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2.5">
                    <h2 className="text-[13px] font-medium text-white">Recent titles</h2>
                    <Link href="/apps" className="text-[11px] text-[#7eb6ff] hover:underline">
                      Open store
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-[12px]">
                      <thead className="border-b border-white/[0.04] text-[10px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3.5 py-2 font-medium">Title</th>
                          <th className="px-3.5 py-2 font-medium">Type</th>
                          <th className="px-3.5 py-2 font-medium">Category</th>
                          <th className="px-3.5 py-2 font-medium">Version</th>
                          <th className="px-3.5 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalog.top.slice(0, 8).map((app) => (
                          <tr key={app.slug} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="px-3.5 py-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="flex h-6 w-6 items-center justify-center rounded text-[9px] font-semibold text-white"
                                  style={{ background: app.accent }}
                                >
                                  {app.letter}
                                </span>
                                <div className="min-w-0">
                                  <Link href={`/app/${app.slug}`} className="block truncate font-medium text-slate-200 hover:text-[#9ec5ff]">
                                    {app.name}
                                  </Link>
                                  <p className="truncate text-[10px] text-slate-600">{app.developer}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-2 capitalize text-slate-400">{app.kind}</td>
                            <td className="px-3.5 py-2 text-slate-400">{app.categoryName}</td>
                            <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">{app.version}</td>
                            <td className="px-3.5 py-2">
                              <span
                                className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                  app.hasApk ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {app.hasApk ? "APK" : "Meta"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : null}

            {section === "tools-all" ? (
              <DbToolsList
                onUploadCsv={() => setSection("tools-csv")}
                onScraper={() => setSection("tools-scraper")}
                onCategories={() => setSection("tools-categories")}
              />
            ) : null}

            {section === "tools-categories" ? (
              <CategoriesPanel onBack={() => setSection("tools-all")} />
            ) : null}

            {section === "tools-csv" ? <CsvImportTool onBack={() => setSection("tools-all")} /> : null}

            {section === "tools-scraper" ? (
              <ApkScraperTool onBack={() => setSection("tools-all")} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Donut({ app, game }: { app: number; game: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const appLen = (app / 100) * c;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#2f7bff"
          strokeWidth="8"
          strokeDasharray={`${appLen} ${c - appLen}`}
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="8"
          strokeDasharray={`${(game / 100) * c} ${c}`}
          strokeDashoffset={-appLen}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-white">{app}%</p>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto tabular-nums text-slate-300">{value}</span>
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone: "emerald" | "amber" | "blue" }) {
  const styles = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-[#2f7bff]/10 text-[#9ec5ff]",
  }[tone];
  return <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${styles}`}>{children}</span>;
}
