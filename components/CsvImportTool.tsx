"use client";

import { useEffect, useRef, useState } from "react";
import { CSV_TEMPLATE, draftToStoreApp, parseApkCsv, type CsvApkDraft } from "@/lib/csvApk";

function token() {
  return window.localStorage.getItem("modplays-token") || window.sessionStorage.getItem("modplays-token") || "";
}

type RowState = "pending" | "adding" | "added" | "error";

const CHUNK = 40;
const PAGE = 25;

export function CsvImportTool({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [drafts, setDrafts] = useState<CsvApkDraft[]>([]);
  const [status, setStatus] = useState<Record<number, RowState>>({});
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [parseError, setParseError] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [busyAll, setBusyAll] = useState(false);
  const [progress, setProgress] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/admin/import", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        setSavedCount(data.count ?? 0);
      } catch {
        /* ignore */
      }
    }
    void loadSaved();
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setProgress("");
    setStatus({});
    setMessages({});
    setPage(0);
    const text = await file.text();
    const result = parseApkCsv(text);
    if (result.error) {
      setDrafts([]);
      setParseError(result.error);
      return;
    }
    setDrafts(result.drafts);
    const next: Record<number, RowState> = {};
    for (const draft of result.drafts) next[draft.row] = "pending";
    setStatus(next);
  }

  async function addOne(draft: CsvApkDraft) {
    setStatus((s) => ({ ...s, [draft.row]: "adding" }));
    setMessages((m) => ({ ...m, [draft.row]: "" }));
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ app: draftToStoreApp(draft) }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; count?: number };
      if (!res.ok) {
        setStatus((s) => ({ ...s, [draft.row]: "error" }));
        setMessages((m) => ({ ...m, [draft.row]: data.message || "Failed to add" }));
        return false;
      }
      setStatus((s) => ({ ...s, [draft.row]: "added" }));
      setSavedCount(data.count ?? 0);
      return true;
    } catch {
      setStatus((s) => ({ ...s, [draft.row]: "error" }));
      setMessages((m) => ({ ...m, [draft.row]: "Network error" }));
      return false;
    }
  }

  async function addAllPending() {
    const pendingDrafts = drafts.filter((d) => status[d.row] !== "added");
    if (!pendingDrafts.length) return;
    setBusyAll(true);
    setProgress(`Saving 0 / ${pendingDrafts.length}…`);
    let done = 0;
    for (let i = 0; i < pendingDrafts.length; i += CHUNK) {
      const chunk = pendingDrafts.slice(i, i + CHUNK);
      for (const draft of chunk) {
        setStatus((s) => ({ ...s, [draft.row]: "adding" }));
      }
      try {
        const res = await fetch("/api/admin/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ apps: chunk.map(draftToStoreApp) }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          saved?: number;
          failed?: number;
          count?: number;
          message?: string;
        };
        if (!res.ok) {
          for (const draft of chunk) {
            setStatus((s) => ({ ...s, [draft.row]: "error" }));
            setMessages((m) => ({ ...m, [draft.row]: data.message || "Bulk save failed" }));
          }
        } else {
          for (const draft of chunk) {
            setStatus((s) => ({ ...s, [draft.row]: "added" }));
          }
          if (typeof data.count === "number") setSavedCount(data.count);
          done += data.saved ?? chunk.length;
        }
      } catch {
        for (const draft of chunk) {
          setStatus((s) => ({ ...s, [draft.row]: "error" }));
          setMessages((m) => ({ ...m, [draft.row]: "Network error" }));
        }
      }
      setProgress(`Saving ${Math.min(i + chunk.length, pendingDrafts.length)} / ${pendingDrafts.length}…`);
    }
    setProgress(`Done. ${done} saved to DB.`);
    setBusyAll(false);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "apk-import-template.csv";
    a.click();
    URL.revokeObjectURL(href);
  }

  const pending = drafts.filter((d) => status[d.row] !== "added").length;
  const added = drafts.filter((d) => status[d.row] === "added").length;
  const pages = Math.max(1, Math.ceil(drafts.length / PAGE));
  const slice = drafts.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold text-white">Upload CSV</h1>
          <p className="text-[12px] text-slate-500">Bulk import to DB — 40 rows per request</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
        >
          ← ALL Tools
        </button>
      </div>

      <section className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-[#2f7bff] px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#2563eb]"
          >
            Upload CSV
          </button>
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
          >
            Template
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
          <div className="ml-auto flex flex-wrap gap-1.5 text-[11px] text-slate-500">
            <span>{savedCount} in DB</span>
            {fileName ? <span className="text-[#9ec5ff]">{fileName}</span> : null}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          name, packageName, version, developer, kind, category, size, apkUrl, iconUrl, short, description, requires
        </p>
        {parseError ? (
          <p className="mt-2 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-[12px] text-rose-200">
            {parseError}
          </p>
        ) : null}
        {progress ? <p className="mt-2 text-[12px] text-[#9ec5ff]">{progress}</p> : null}
      </section>

      {drafts.length ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] text-slate-500">
              {drafts.length} loaded · {added} added · {pending} pending
            </p>
            <button
              type="button"
              disabled={busyAll || pending === 0}
              onClick={() => void addAllPending()}
              className="rounded-md bg-[#2f7bff] px-2.5 py-1.5 text-[12px] font-medium text-white disabled:opacity-40"
            >
              {busyAll ? "Saving to DB…" : `Add all pending (${pending})`}
            </button>
          </div>

          <div className="space-y-2">
            {slice.map((draft) => {
              const state = status[draft.row] ?? "pending";
              return (
                <article key={draft.row} className="rounded-lg border border-white/[0.06] bg-[#121820] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-600">#{draft.row}</span>
                        <h2 className="truncate text-[13px] font-medium text-white">{draft.name}</h2>
                        <StateChip state={state} />
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-600">{draft.packageName}</p>
                      <div className="mt-2 grid gap-1.5 text-[11px] text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                        <Meta label="Version" value={draft.version} />
                        <Meta label="Developer" value={draft.developer} />
                        <Meta label="Kind" value={draft.kind} />
                        <Meta label="Category" value={draft.category} />
                        <Meta label="Size" value={draft.size} />
                        <Meta label="Requires" value={draft.requires} />
                        <Meta label="APK URL" value={draft.apkUrl || "—"} wide />
                        <Meta label="Short" value={draft.short || "—"} wide />
                      </div>
                      {messages[draft.row] ? (
                        <p className="mt-1 text-[11px] text-rose-300">{messages[draft.row]}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={state === "adding" || state === "added" || busyAll}
                      onClick={() => void addOne(draft)}
                      className={`shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-medium ${
                        state === "added"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-[#2f7bff] text-white hover:bg-[#2563eb] disabled:opacity-50"
                      }`}
                    >
                      {state === "adding" ? "Adding…" : state === "added" ? "Added" : "Add"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {pages > 1 ? (
            <div className="flex items-center justify-between text-[12px] text-slate-500">
              <span>
                Page {page + 1} / {pages}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-md border border-white/[0.08] px-2 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pages - 1}
                  onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                  className="rounded-md border border-white/[0.08] px-2 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <section className="rounded-lg border border-dashed border-white/[0.08] px-4 py-10 text-center">
          <p className="text-[13px] font-medium text-slate-300">No CSV loaded</p>
          <p className="mt-1 text-[12px] text-slate-600">Upload CSV, then Add all pending to save into DB.</p>
        </section>
      )}
    </>
  );
}

function Meta({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[9px] uppercase tracking-wide text-slate-600">{label}</p>
      <p className="truncate text-slate-300">{value}</p>
    </div>
  );
}

function StateChip({ state }: { state: RowState }) {
  const map = {
    pending: "bg-amber-500/10 text-amber-400",
    adding: "bg-[#2f7bff]/10 text-[#9ec5ff]",
    added: "bg-emerald-500/10 text-emerald-400",
    error: "bg-rose-500/10 text-rose-400",
  }[state];
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${map}`}>{state}</span>;
}
