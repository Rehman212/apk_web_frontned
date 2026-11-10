import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FaqList } from "@/components/FaqList";
import { ShotGallery, ShotRail } from "@/components/ShotGallery";
import {
  allApps,
  categories,
  displayDownloads,
  displayRating,
  formatRating,
  type StoreApp,
} from "@/lib/catalog";
import { hdMediaUrl } from "@/lib/media";
import { htmlToPlainText, looksLikeHtml, sanitizeHtml } from "@/lib/sanitizeHtml";
import { resolveApp } from "@/lib/resolveApp";

export async function generateMetadata({ params }: PageProps<"/app/[slug]">) {
  const { slug } = await params;
  const app = await resolveApp(slug);
  if (!app) return { title: "App" };
  const metaDesc = htmlToPlainText(app.short || app.description).slice(0, 160);
  return {
    title: `${app.name} APK Download`,
    description: metaDesc || `Download ${app.name} APK ${app.version} for Android.`,
    keywords: [app.name, `${app.name} APK`, `${app.name} download`, app.category, "Android APK"],
  };
}

export default async function AppDetailPage({ params }: PageProps<"/app/[slug]">) {
  const { slug } = await params;
  const app = await resolveApp(slug);
  if (!app) notFound();

  const category = categories.find((item) => item.slug === app.category);
  const categoryName = category?.name ?? titleCase(app.category);
  const kindLabel = app.kind === "game" ? "Games" : "Apps";
  const kindSingular = app.kind === "game" ? "Game" : "App";
  const rating = displayRating(app);
  const downloads = app.downloads && app.downloads !== "0" ? app.downloads : displayDownloads(app);
  const icon = hdMediaUrl(app.iconUrl, 512) || app.iconUrl || `/api/icon/${app.slug}`;
  const heroArt =
    app.screenshots?.[0]
      ? hdMediaUrl(app.screenshots[0], 900) || app.screenshots[0]
      : `/api/hero/${app.slug}`;
  const heroBg = app.screenshots?.[0]
    ? hdMediaUrl(app.screenshots[0], 900) || app.screenshots[0]
    : `/api/promo/${app.slug}/0`;
  const promos =
    app.screenshots && app.screenshots.length
      ? app.screenshots.slice(0, 4).map((src) => hdMediaUrl(src, 720) || src)
      : [0, 1, 2, 3].map((i) => `/api/promo/${app.slug}/${i}`);
  const pool = allApps().filter((item) => item.slug !== app.slug);
  const sameCategory = pool.filter((item) => item.category === app.category);
  const similar = (sameCategory.length ? sameCategory : pool.filter((item) => item.kind === app.kind)).slice(0, 5);
  const used = new Set(similar.map((item) => item.slug));
  const also = pool.filter((item) => !used.has(item.slug)).slice(0, 5);
  const chips = [categoryName, app.kind === "game" ? "Arcade" : "Utility", "Offline", "MOD Features"];

  return (
    <div className="overflow-x-hidden bg-[#f5f7fb]">
      <section className="relative w-full overflow-hidden border-b border-[#e7edf5] bg-[#0b1424]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-[2px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07111f_0%,rgba(7,17,31,.88)_38%,rgba(7,17,31,.45)_68%,rgba(7,17,31,.2)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,.15)_0%,rgba(7,17,31,.55)_100%)]" />

        <div className="relative z-10 grid w-full items-end gap-6 px-3 py-6 sm:px-4 sm:py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <p className="text-[13px] text-slate-300/80">
              <Crumb href="/" light>
                Home
              </Crumb>
              <Sep light />
              <Crumb href={app.kind === "game" ? "/games" : "/apps"} light>
                {kindLabel}
              </Crumb>
              <Sep light />
              <Crumb href={`/category/${app.category}`} light>
                {categoryName}
              </Crumb>
              <Sep light />
              <span className="text-white/90">{app.name}</span>
            </p>

            <div className="mt-5 flex items-start gap-4 sm:gap-5">
              <div className="shrink-0 overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,.35)] ring-2 ring-white/15">
                <AppIcon app={app} size={92} />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-white sm:text-[36px]">
                    {app.name}
                  </h1>
                  <span className="rounded-[5px] bg-[#22c55e] px-2 py-1 text-[11px] font-extrabold tracking-wide text-white">
                    MOD APK
                  </span>
                </div>
                <p className="mt-3 text-[13px] text-slate-300 sm:text-[14px]">
                  v{app.version}
                  <span className="px-1.5 text-slate-500">•</span>
                  {oneLine(app.short)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-slate-200">
                  <Stars rating={rating} />
                  <span className="font-bold text-white">{formatRating(rating)}</span>
                  <span className="text-slate-400">({app.ratingsCount || "Reviews"})</span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5b9bff]" fill="currentColor" aria-hidden>
                      <path d="M12 3 6.5 8.5h3.2V16h4.6V8.5h3.2L12 3zM5 18h14v2H5z" />
                    </svg>
                    {downloads} Downloads
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <Link
                      key={chip}
                      href={
                        chip === categoryName
                          ? `/category/${app.category}`
                          : app.kind === "game"
                            ? "/games"
                            : "/apps"
                      }
                      className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${
                        chip === "MOD Features"
                          ? "bg-[#22c55e]/20 text-[#86efac] ring-1 ring-[#22c55e]/35"
                          : "bg-white/10 text-slate-100 ring-1 ring-white/10 hover:bg-white/15"
                      }`}
                    >
                      {chip}
                    </Link>
                  ))}
                </div>
                <a
                  href={`/api/download/${app.slug}`}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2f6fed] px-6 text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(47,111,237,.35)] hover:bg-[#245ad0] lg:hidden"
                >
                  Download APK
                </a>
              </div>
            </div>
          </div>

          <div className="relative hidden h-[240px] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroArt}
              alt=""
              className="absolute bottom-0 right-0 h-[280px] w-auto max-w-none object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,.45)]"
            />
          </div>
        </div>
      </section>

      <div className="grid w-full items-start gap-8 px-3 py-5 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div>
            <ShotGallery name={app.name} shots={promos} cover={icon} />
          </div>

          <Flat icon="info" title="Overview">
            {looksLikeHtml(app.description || "") ? (
              <div
                className="max-w-3xl text-[14px] leading-7 text-[#5b6575] [&_a]:text-[#2f6fed] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#dbe4f3] [&_blockquote]:pl-3 [&_blockquote]:text-[#6b7280] [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:text-[#111827] [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#111827] [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-md [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(app.description) }}
              />
            ) : (
              <p className="max-w-3xl text-[14px] leading-7 text-[#5b6575]">
                {overviewText(app.description || app.short)} Download the {app.name} APK ({app.version}) for Android{" "}
                {app.requires}.
              </p>
            )}
          </Flat>

          <Flat icon="table" title={`${kindSingular} Information`}>
            <div className="grid sm:grid-cols-2">
              <Cell label={`${kindSingular} Name`} value={app.name} />
              <Cell label="Category" value={categoryName} />
              <Cell label="Version" value={app.version} />
              <Cell label="Developer" value={app.developer} />
              <Cell label="Size" value={app.size} />
              <Cell label="Package Name" value={app.packageName} />
              <Cell label="Requires Android" value={app.requires} />
              <Cell label="Price" value="Free" />
            </div>
          </Flat>

          <Flat icon="check" title={`Features of ${app.name} MOD APK`}>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {featureList(app, categoryName).map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-[#374151]">
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <path d="M4.5 10.5 8 14l7.5-8" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Flat>

          <Flat icon="spark" title={`What's New in v${app.version}`}>
            <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-6 text-[#5b6575]">
              {newsItems(app).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Flat>

          <Flat icon="image" title="Screenshots">
            <ShotRail name={app.name} shots={promos} cover={icon} />
          </Flat>

          <Flat icon="download" title={`How to Install ${app.name} APK`}>
            <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                "Download the APK file from the button above.",
                "Enable Unknown sources in your Android settings.",
                "Locate the downloaded file and tap to install.",
                "Open the app and start using the latest build.",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f6fed] text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[13px] leading-5 text-[#526077]">{step}</span>
                </li>
              ))}
            </ol>
          </Flat>

          <Flat icon="help" title="Frequently Asked Questions">
            <FaqList
              items={[
                {
                  q: `Is ${app.name} APK safe to download?`,
                  a: `${app.name} is served from this catalog as package ${app.packageName}. Install only the file you download from the button on this page.`,
                },
                {
                  q: "Do I need an internet connection to play?",
                  a: "The download needs a connection. After install, offline use depends on the app. Online features still need a network.",
                },
                {
                  q: `What is included in v${app.version}?`,
                  a: app.whatsNew || `${app.name} ${app.version} is the current build, updated ${app.updated}.`,
                },
                {
                  q: `How do I update ${app.name} APK?`,
                  a: "Come back to this page, download the newer file, and install it over the current app.",
                },
              ]}
            />
          </Flat>
        </div>

        <aside className="space-y-6 lg:pt-7">
          <section>
            <h2 className="text-[20px] font-bold leading-6 text-[#121826]">Download {app.name}</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-[#6b7280]">
              Get the latest {app.name} APK version with the current catalog build unlocked.
            </p>
            <a
              href={`/api/download/${app.slug}`}
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2f6fed] text-[15px] font-bold text-white hover:bg-[#245ad0]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M12 3 6.2 8.8h3.3V16h4.9V8.8h3.4L12 3zM5 18.5h14v2H5z" />
              </svg>
              Download APK
            </a>
            <p className="mt-3 flex items-start gap-2 text-[12.5px] text-[#16a34a]">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
                <svg viewBox="0 0 20 20" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M4.5 10.5 8 14l7.5-8" />
                </svg>
              </span>
              <span>
                <span className="font-semibold">100% Safe & Secure</span>
                <span className="mt-0.5 block text-[11px] font-medium text-[#22c55e]">Scanned catalog package</span>
              </span>
            </p>
            <dl className="mt-5 space-y-2.5 text-[13px]">
              <Meta label="Version" value={app.version} />
              <Meta label="Size" value={app.size} />
              <Meta label="Requires Android" value={app.requires} />
              <Meta label="Developer" value={app.developer} />
              <Meta label="Package Name" value={app.packageName} />
              <Meta label="Last Updated" value={app.updated} />
            </dl>
          </section>

          <SideList title={app.kind === "game" ? "Similar Games" : "Similar Apps"} href={app.kind === "game" ? "/games" : "/apps"} apps={similar} />
          <SideList title="You May Also Like" href="/apps" apps={also} />

          <section>
            <h2 className="text-[16px] font-bold text-[#121826]">Tags</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tagList(app, categoryName).map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-md bg-[#f3f5f8] px-2.5 py-1 text-[12px] font-medium text-[#526077] hover:bg-[#e7eefc] hover:text-[#2f6fed]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function overviewText(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= 340) return clean;
  const cut = clean.slice(0, 340);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return `${cut.slice(0, last > 180 ? last : 340).replace(/[.\s]+$/, "")}.`;
}

function oneLine(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  const sentence = clean.split(/[.!?]/)[0] || clean;
  return sentence.length > 52 ? `${sentence.slice(0, 49)}…` : sentence;
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function featureList(app: StoreApp, categoryName: string) {
  return [
    "Latest version with new features",
    `${categoryName} on Android`,
    app.kind === "game" ? "Offline mode supported" : "Works after install",
    "Easy to install",
    "Ad-free catalog listing",
    "Safe and secure APK",
    "Smooth and updated build",
    "Regular updates",
  ];
}

function newsItems(app: StoreApp) {
  const text = (app.whatsNew || "").trim();
  if (!text) return [`Current build is v${app.version}.`, `Updated ${app.updated}.`];
  return text.split(/(?<=[.!])\s+/).map((part) => part.trim()).filter(Boolean).slice(0, 5);
}

function tagList(app: StoreApp, categoryName: string) {
  return [app.name, `${app.name} APK`, `${app.name} Download`, `${app.name} Latest Version`, categoryName, "Android APK", app.developer];
}

function Crumb({
  href,
  children,
  light,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Link href={href} className={light ? "hover:text-white" : "hover:text-[#2f6fed]"}>
      {children}
    </Link>
  );
}

function Sep({ light }: { light?: boolean }) {
  return <span className={`px-1.5 ${light ? "text-slate-500" : "text-[#c5cad3]"}`}>›</span>;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-[#f5b400]" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i < full ? "currentColor" : "#e5e7eb"}>
          <path d="M10 1.6 12.4 6.7l5.6.8-4 3.9.9 5.5L10 14.4 5.1 16.9l.9-5.5-4-3.9 5.6-.8L10 1.6z" />
        </svg>
      ))}
    </span>
  );
}

function Flat({
  icon,
  title,
  children,
}: {
  icon: "info" | "table" | "check" | "spark" | "image" | "download" | "help";
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2.5 text-[16px] font-bold text-[#121826]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f1ff] text-[#2f6fed]">
          <SectionIcon name={icon} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionIcon({ name }: { name: "info" | "table" | "check" | "spark" | "image" | "download" | "help" }) {
  const common = { viewBox: "0 0 24 24", className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "info") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    );
  }
  if (name === "table") {
    return (
      <svg {...common} aria-hidden>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16M12 10v9" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12.2 2.3 2.3 4.7-5" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg {...common} aria-hidden>
        <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9 12 3.5z" />
      </svg>
    );
  }
  if (name === "image") {
    return (
      <svg {...common} aria-hidden>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="m8 15 2.5-2.5L14 16l2-2 2 2" />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg {...common} aria-hidden>
        <path d="M12 4v10m0 0 3.5-3.5M12 14 8.5 10.5M5 18h14" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6V14" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eef2f6] py-3 text-[13px] sm:odd:pr-6 sm:even:pl-6">
      <span className="text-[#8b95a7]">{label}</span>
      <span className="truncate text-right font-semibold text-[#1f2937]" title={value}>
        {value}
      </span>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[#8b95a7]">{label}</dt>
      <dd className="max-w-[168px] truncate text-right font-semibold text-[#1f2937]" title={value}>
        {value}
      </dd>
    </div>
  );
}

function SideList({ title, href, apps }: { title: string; href: string; apps: StoreApp[] }) {
  if (!apps.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#121826]">{title}</h2>
        <Link href={href} className="text-[12px] font-semibold text-[#2f6fed]">
          View All →
        </Link>
      </div>
      <ul className="space-y-3.5">
        {apps.map((item) => {
          const rating = displayRating(item);
          return (
            <li key={`${title}-${item.slug}`}>
              <div className="flex items-center gap-3">
                <Link href={`/app/${item.slug}`} className="shrink-0 overflow-hidden rounded-xl">
                  <AppIcon app={item} size={44} />
                </Link>
                <Link href={`/app/${item.slug}`} className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-[#1f2937]">{item.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#8b95a7]">
                    <span>v{item.version}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                    <span className="text-[#f5b400]">★</span>
                    <span>{formatRating(rating)}</span>
                  </p>
                </Link>
                <Link
                  href={`/app/${item.slug}`}
                  className="shrink-0 rounded-md bg-[#2f6fed] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#245ad0]"
                >
                  Download
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
