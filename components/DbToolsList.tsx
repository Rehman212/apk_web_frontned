"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBase } from "@/lib/apiBase";
import { HOME_SECTIONS, sectionName } from "@/lib/homeSections";

type DbApk = {
  id: string;
  slug: string;
  name: string;
  packageName: string;
  developer?: string;
  kind?: string;
  category?: string;
  homeSection?: string;
  version?: string;
  size?: string;
  apkUrl?: string | null;
  iconUrl?: string | null;
  letter?: string;
  accent?: string;
};

function token() {
  return window.localStorage.getItem("modplays-token") || window.sessionStorage.getItem("modplays-token") || "";
}

export function DbToolsList({
  onUploadCsv,
  onScraper,
  onCategories,
}: {
  onUploadCsv: () => void;
  onScraper: () => void;
  onCategories?: () => void;
}) {
  const [apps, setApps] = useState<DbApk[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [editing, setEditing] = useState<DbApk | null>(null);
  const [editSection, setEditSection] = useState("latest-updates");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/import", {
        headers: { Authorization: `Bearer ${token()}` },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as {
        apps?: DbApk[];
        count?: number;
        message?: string;
      };
      if (!res.ok) {
        setError(data.message || "Failed to load DB tools");
        setApps([]);
        setCount(0);
        return;
      }
      setApps(Array.isArray(data.apps) ? data.apps : []);
      setCount(data.count ?? data.apps?.length ?? 0);
    } catch {
      setError("Cannot load tools from database.");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return apps.filter((app) => {
      if (sectionFilter !== "all" && app.homeSection !== sectionFilter) return false;
      if (!query) return true;
      return [app.name, app.packageName, app.developer, app.homeSection]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [apps, q, sectionFilter]);

  async function saveEdit() {
    if (!editing?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase()}/api/apps/${editing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ homeSection: editSection }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setError(data.message || "Failed to update category");
        return;
      }
      setApps((list) =>
        list.map((a) => (a.id === editing.id ? { ...a, homeSection: editSection } : a)),
      );
      setEditing(null);
    } catch {
      setError("Cannot reach backend to save category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold text-white">ALL Tools</h1>
          <p className="text-[12px] text-slate-500">
            {loading ? "Loading…" : `${count} APKs in DB — edit to set homepage category`}
          </p>
        </div>
        <div className="flex gap-1.5">
          {onCategories ? (
            <button
              type="button"
              onClick={onCategories}
              className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
            >
              Categories
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onUploadCsv}
          className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5 text-left hover:border-white/[0.12]"
        >
          <p className="text-[13px] font-medium text-white">Upload CSV</p>
          <p className="mt-1 text-[12px] text-slate-500">Import APK rows one by one</p>
        </button>
        <button
          type="button"
          onClick={onScraper}
          className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5 text-left hover:border-white/[0.12]"
        >
          <p className="text-[13px] font-medium text-white">Get APK Scraper</p>
          <p className="mt-1 text-[12px] text-slate-500">Fetch packages for catalog</p>
        </button>
      </div>

      <section className="rounded-lg border border-white/[0.06] bg-[#121820]">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3.5 py-2.5">
          <p className="text-[13px] font-medium text-white">Database tools</p>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-md border border-white/[0.08] bg-[#0b0f14] px-2 py-1.5 text-[12px] text-slate-300 outline-none"
          >
            <option value="all">All categories</option>
            {HOME_SECTIONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter…"
            className="ml-auto w-full max-w-xs rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-1.5 text-[12px] outline-none placeholder:text-slate-600 sm:w-56"
          />
        </div>

        {error ? <p className="px-3.5 py-3 text-[12px] text-rose-300">{error}</p> : null}

        {loading ? (
          <p className="px-3.5 py-8 text-center text-[12px] text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-3.5 py-8 text-center text-[12px] text-slate-500">No tools found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[12px]">
              <thead className="border-b border-white/[0.04] text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3.5 py-2 font-medium">App</th>
                  <th className="px-3.5 py-2 font-medium">Package</th>
                  <th className="px-3.5 py-2 font-medium">Homepage category</th>
                  <th className="px-3.5 py-2 font-medium">Version</th>
                  <th className="px-3.5 py-2 font-medium">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id || app.packageName} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        {app.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.iconUrl} alt="" className="h-7 w-7 rounded object-cover" />
                        ) : (
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded text-[9px] font-semibold text-white"
                            style={{ background: app.accent || "#2f7bff" }}
                          >
                            {(app.letter || app.name || "?").slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-200">{app.name}</p>
                          <p className="truncate text-[10px] text-slate-600">{app.developer || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[160px] truncate px-3.5 py-2 font-mono text-[11px] text-slate-500">
                      {app.packageName}
                    </td>
                    <td className="px-3.5 py-2">
                      <span className="rounded bg-[#2f7bff]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#9ec5ff]">
                        {sectionName(app.homeSection)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400">{app.version || "—"}</td>
                    <td className="px-3.5 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(app);
                          setEditSection(app.homeSection || "latest-updates");
                        }}
                        className="text-[11px] font-medium text-[#7eb6ff] hover:underline"
                      >
                        Edit
                      </button>
                      {" · "}
                      <Link href={`/app/${app.slug}`} className="text-[11px] font-medium text-slate-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#121820] p-4 shadow-2xl">
            <h2 className="text-[14px] font-semibold text-white">Edit tool category</h2>
            <p className="mt-1 text-[12px] text-slate-500">{editing.name}</p>
            <label className="mt-4 block text-[11px] text-slate-400">Homepage category</label>
            <select
              value={editSection}
              onChange={(e) => setEditSection(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
            >
              {HOME_SECTIONS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-slate-600">
              Ye category homepage pe us section mein show hogi (Latest Updates, Popular Games, …).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md px-3 py-1.5 text-[12px] text-slate-400 hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveEdit()}
                className="rounded-md bg-[#2f7bff] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
