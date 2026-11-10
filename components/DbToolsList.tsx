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
  short?: string;
  description?: string;
  requires?: string;
  letter?: string;
  accent?: string;
};

type EditForm = {
  name: string;
  slug: string;
  packageName: string;
  developer: string;
  kind: string;
  category: string;
  homeSection: string;
  version: string;
  size: string;
  apkUrl: string;
  iconUrl: string;
  short: string;
  description: string;
  requires: string;
  accent: string;
};

function token() {
  return window.localStorage.getItem("modplays-token") || window.sessionStorage.getItem("modplays-token") || "";
}

function toForm(app: DbApk): EditForm {
  return {
    name: app.name || "",
    slug: app.slug || "",
    packageName: app.packageName || "",
    developer: app.developer || "",
    kind: app.kind || "app",
    category: app.category || "tools",
    homeSection: app.homeSection || "latest-updates",
    version: app.version || "",
    size: app.size || "",
    apkUrl: app.apkUrl || "",
    iconUrl: app.iconUrl || "",
    short: app.short || "",
    description: app.description || "",
    requires: app.requires || "Android 8.0+",
    accent: app.accent || "#2f7bff",
  };
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
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  function openEdit(app: DbApk) {
    setError("");
    setEditing(app);
    setForm(toForm(app));
  }

  function closeEdit() {
    if (saving || deletingId) return;
    setEditing(null);
    setForm(null);
  }

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function saveEdit() {
    if (!editing?.id || !form) return;
    if (!form.name.trim() || !form.slug.trim() || !form.packageName.trim()) {
      setError("Name, slug aur package name required hain.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase()}/api/apps/${editing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          packageName: form.packageName.trim(),
          developer: form.developer.trim(),
          kind: form.kind.trim(),
          category: form.category.trim(),
          homeSection: form.homeSection,
          version: form.version.trim(),
          size: form.size.trim(),
          apkUrl: form.apkUrl.trim(),
          iconUrl: form.iconUrl.trim(),
          short: form.short,
          description: form.description,
          requires: form.requires.trim(),
          accent: form.accent.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        app?: DbApk;
        message?: string | string[];
      };
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        setError(msg || "Failed to update product");
        return;
      }
      const updated = data.app;
      if (updated) {
        setApps((list) => list.map((a) => (a.id === editing.id ? { ...a, ...updated } : a)));
      } else {
        setApps((list) =>
          list.map((a) =>
            a.id === editing.id
              ? {
                  ...a,
                  ...form,
                  apkUrl: form.apkUrl || null,
                  iconUrl: form.iconUrl || null,
                }
              : a,
          ),
        );
      }
      setEditing(null);
      setForm(null);
    } catch {
      setError("Cannot reach backend to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteApp(app: DbApk, fromModal = false) {
    if (!app.id) return;
    const ok = window.confirm(`Delete "${app.name}"? Ye APK DB se permanently hat jayegi.`);
    if (!ok) return;
    setDeletingId(app.id);
    setError("");
    try {
      const res = await fetch(`${apiBase()}/api/apps/${app.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        count?: number;
        message?: string | string[];
      };
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        setError(msg || "Failed to delete product");
        return;
      }
      setApps((list) => list.filter((a) => a.id !== app.id));
      setCount((c) => (typeof data.count === "number" ? data.count : Math.max(0, c - 1)));
      if (fromModal || editing?.id === app.id) {
        setEditing(null);
        setForm(null);
      }
    } catch {
      setError("Cannot reach backend to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold text-white">ALL Tools</h1>
          <p className="text-[12px] text-slate-500">
            {loading ? "Loading…" : `${count} APKs in DB — edit content ya delete`}
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

        {error && !editing ? <p className="px-3.5 py-3 text-[12px] text-rose-300">{error}</p> : null}

        {loading ? (
          <p className="px-3.5 py-8 text-center text-[12px] text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-3.5 py-8 text-center text-[12px] text-slate-500">No tools found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[12px]">
              <thead className="border-b border-white/[0.04] text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3.5 py-2 font-medium">App</th>
                  <th className="px-3.5 py-2 font-medium">Package</th>
                  <th className="px-3.5 py-2 font-medium">Homepage category</th>
                  <th className="px-3.5 py-2 font-medium">Version</th>
                  <th className="px-3.5 py-2 font-medium">Actions</th>
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
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <button
                          type="button"
                          onClick={() => openEdit(app)}
                          className="text-[11px] font-medium text-[#7eb6ff] hover:underline"
                        >
                          Edit product
                        </button>
                        <Link
                          href={`/app/${app.slug}`}
                          className="text-[11px] font-medium text-slate-400 hover:underline"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === app.id}
                          onClick={() => void deleteApp(app)}
                          className="text-[11px] font-medium text-rose-400 hover:underline disabled:opacity-50"
                        >
                          {deletingId === app.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && form ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#121820] p-4 shadow-2xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-white">Edit product</h2>
                <p className="mt-1 text-[12px] text-slate-500">{editing.name}</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-white/[0.04]"
              >
                Close
              </button>
            </div>

            {error ? <p className="mt-3 text-[12px] text-rose-300">{error}</p> : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] text-slate-400 sm:col-span-2">
                Name
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Slug
                <input
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 font-mono text-[12px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Package name
                <input
                  value={form.packageName}
                  onChange={(e) => setField("packageName", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 font-mono text-[12px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Developer
                <input
                  value={form.developer}
                  onChange={(e) => setField("developer", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Homepage category
                <select
                  value={form.homeSection}
                  onChange={(e) => setField("homeSection", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                >
                  {HOME_SECTIONS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-slate-400">
                Kind
                <input
                  value={form.kind}
                  onChange={(e) => setField("kind", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Category
                <input
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Version
                <input
                  value={form.version}
                  onChange={(e) => setField("version", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Size
                <input
                  value={form.size}
                  onChange={(e) => setField("size", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Requires
                <input
                  value={form.requires}
                  onChange={(e) => setField("requires", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400">
                Accent
                <input
                  value={form.accent}
                  onChange={(e) => setField("accent", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 font-mono text-[12px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400 sm:col-span-2">
                Icon URL
                <input
                  value={form.iconUrl}
                  onChange={(e) => setField("iconUrl", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 font-mono text-[12px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400 sm:col-span-2">
                APK / download URL
                <input
                  value={form.apkUrl}
                  onChange={(e) => setField("apkUrl", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 font-mono text-[12px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400 sm:col-span-2">
                Short description
                <textarea
                  rows={2}
                  value={form.short}
                  onChange={(e) => setField("short", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] text-slate-200 outline-none"
                />
              </label>
              <label className="block text-[11px] text-slate-400 sm:col-span-2">
                Full description / content
                <textarea
                  rows={8}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/[0.08] bg-[#0b0f14] px-2.5 py-2 text-[13px] leading-5 text-slate-200 outline-none"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={saving || deletingId === editing.id}
                onClick={() => void deleteApp(editing, true)}
                className="rounded-md border border-rose-500/30 px-3 py-1.5 text-[12px] font-medium text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
              >
                {deletingId === editing.id ? "Deleting…" : "Delete product"}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving || !!deletingId}
                  className="rounded-md px-3 py-1.5 text-[12px] text-slate-400 hover:bg-white/[0.04] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !!deletingId}
                  onClick={() => void saveEdit()}
                  className="rounded-md bg-[#2f7bff] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
