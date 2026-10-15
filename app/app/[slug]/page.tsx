import Link from "next/link";
import { notFound } from "next/navigation";
import { AppIcon } from "@/components/AppIcon";
import { AppRow } from "@/components/AppCard";
import { getApp, similarApps } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/app/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);
  return {
    title: app ? `${app.name} APK` : "App",
    description: app?.description,
  };
}

export default async function AppDetailPage({ params }: PageProps<"/app/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();
  const related = similarApps(app);

  return (
    <div className="w-full px-3 py-8 sm:px-4">
      <p className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-[#0ea24a]">
          Home
        </Link>
        {" / "}
        <Link href={app.kind === "game" ? "/games" : "/apps"} className="hover:text-[#0ea24a]">
          {app.kind === "game" ? "Games" : "Apps"}
        </Link>
        {" / "}
        <Link href={`/category/${app.category}`} className="capitalize hover:text-[#0ea24a]">
          {app.category}
        </Link>
      </p>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <AppIcon app={app} size={96} />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold text-zinc-900">{app.name}</h1>
            <p className="mt-1 font-medium text-[#0ea24a]">{app.developer}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
              <span>{app.license || "Open source"}</span>
              <span>{app.size}</span>
              <span>v{app.version}</span>
              <span>{app.requires}</span>
            </div>
            <p className="mt-4 max-w-2xl text-zinc-700">{app.short}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`/api/download/${app.slug}`}
                className="inline-flex items-center rounded-full bg-[#15c15d] px-8 py-3 text-base font-bold text-white shadow-sm hover:bg-[#12a850]"
              >
                Download APK
              </a>
              {app.sourceUrl ? (
                <a
                  href={app.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700"
                >
                  Source
                </a>
              ) : null}
              <span className="self-center text-sm text-zinc-500">
                Real APK from F-Droid
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
          {(app.screenshots && app.screenshots.length
            ? app.screenshots
            : [0, 1, 2, 3].map((i) => `/api/shot/${app.slug}/${i}`)
          ).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${app.name} screenshot`}
              width={180}
              height={380}
              className="h-[380px] w-[180px] shrink-0 rounded-2xl border border-zinc-200 bg-zinc-100 object-cover shadow-sm"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">About this {app.kind}</h2>
            <p className="mt-3 leading-7 text-zinc-700">{app.description}</p>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-zinc-500">
              What&apos;s new
            </h3>
            <p className="mt-2 text-zinc-700">{app.whatsNew}</p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">Version history</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Older builds stay listed so you can match a device, same idea as a full APK store.
            </p>
            <ul className="mt-4 divide-y divide-zinc-100">
              {app.versions.map((version) => (
                <li key={version.version} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {app.name} {version.version}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {version.date} · {version.size} · {version.notes}
                    </p>
                  </div>
                  <a
                    href={`/api/download/${app.slug}?v=${encodeURIComponent(version.version)}`}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">F-Droid</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              This listing comes from the official F-Droid repository: free and open-source Android
              apps with signed builds. It is not a copy of Play Store or APKPure packages.
            </p>
            {app.sourceUrl ? (
              <a href={app.sourceUrl} className="mt-3 inline-block text-sm font-medium text-[#0ea24a]" target="_blank" rel="noreferrer">
                View source code
              </a>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">Additional information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Info label="Updated" value={app.updated} />
              <Info label="Version" value={app.version} />
              <Info label="Requires" value={app.requires} />
              <Info label="License" value={app.license || "Open source"} />
              <Info label="Package" value={app.packageName} />
            </dl>
          </section>
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">Similar</h2>
            <div className="mt-4 grid gap-3">
              {related.map((item) => (
                <AppRow key={item.slug} app={item} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
