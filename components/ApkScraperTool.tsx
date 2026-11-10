"use client";

import { useEffect, useRef, useState } from "react";
import { apiBase } from "@/lib/apiBase";

function token() {
  return (
    window.localStorage.getItem("modplays-token") ||
    window.sessionStorage.getItem("modplays-token") ||
    ""
  );
}

type JobStatus = {
  id: string;
  website: string;
  status: string;
  total: number;
  processed: number;
  current: string;
  cancel: boolean;
  skipped: number;
  success: number;
  limit?: number | null;
  mode?: "catalog" | "custom";
  errors: { url: string; error: string }[];
  message?: string;
};

type ScrapeMode = "catalog" | "custom";

const LIMIT_PRESETS = [100, 200, 500, 1000, 2500] as const;

export function ApkScraperTool({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<ScrapeMode>("catalog");
  const [url, setUrl] = useState("https://androidapks.com/");
  const [customUrls, setCustomUrls] = useState("");
  const [limit, setLimit] = useState("100");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState(
    "Catalog scrape (limit) ya specific app URL(s) se scrape karein.",
  );
  const [job, setJob] = useState<JobStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("androidapks-job-id");
    if (saved) {
      setJobId(saved);
      void poll(saved);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function api(path: string, init?: RequestInit) {
    let res: Response;
    try {
      res = await fetch(`${apiBase()}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
          ...(init?.headers || {}),
        },
      });
    } catch {
      throw new Error(`Cannot reach API at ${apiBase()}. Start Nest backend: npm run start:dev`);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray((data as { message?: string }).message)
        ? (data as { message: string[] }).message[0]
        : (data as { message?: string }).message;
      if (res.status === 401) throw new Error("Session expired. Sign in again.");
      if (res.status === 404) {
        throw new Error(
          msg ||
            `Scrape API missing on ${apiBase()}. Restart Nest backend so /api/scrape routes load.`,
        );
      }
      throw new Error(msg || `Request failed (${res.status})`);
    }
    return data;
  }

  async function poll(id: string) {
    try {
      const data = (await api(`/api/scrape/apk/status?id=${encodeURIComponent(id)}`)) as JobStatus;
      setJob(data);
      const active = data.status === "discovering" || data.status === "running";
      setBusy(active);
      const modeNote = data.mode === "custom" ? " · custom URL" : "";
      const limitNote = data.limit ? ` · limit ${data.limit}` : "";
      setStatus(
        `${data.status.replaceAll("_", " ")}${modeNote}${limitNote} · ${data.total} queued · ${data.processed} processed · ${data.success} apps scraped · ${data.skipped || 0} skipped · ${data.errors.length} errors`,
      );
      if (active) {
        timer.current = window.setTimeout(() => void poll(id), 2000);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Status failed");
      timer.current = window.setTimeout(() => void poll(id), 5000);
    }
  }

  async function start() {
    if (timer.current) window.clearTimeout(timer.current);
    setBusy(true);
    try {
      let body: Record<string, unknown>;

      if (mode === "custom") {
        const urls = customUrls
          .split(/[\n,]+/)
          .map((u) => u.trim())
          .filter(Boolean);
        if (!urls.length) {
          throw new Error("Kam az kam ek androidapks.com app page URL likho.");
        }
        body = {
          mode: "custom",
          url: urls[0],
          urls,
        };
      } else {
        const trimmed = limit.trim();
        const parsed = trimmed === "" ? undefined : Number(trimmed);
        if (parsed !== undefined && (!Number.isFinite(parsed) || parsed < 1)) {
          throw new Error("Limit 1 ya us se zyada number likho, ya blank chhor do for all.");
        }
        body = {
          mode: "catalog",
          url: url.trim() || "https://androidapks.com/",
          limit: parsed,
        };
      }

      const data = (await api("/api/scrape/apk/start", {
        method: "POST",
        body: JSON.stringify(body),
      })) as { id: string };
      setJobId(data.id);
      window.localStorage.setItem("androidapks-job-id", data.id);
      void poll(data.id);
    } catch (err) {
      setBusy(false);
      setStatus(err instanceof Error ? err.message : "Start failed");
    }
  }

  async function stop() {
    if (!jobId) return;
    try {
      await api("/api/scrape/apk/cancel", {
        method: "POST",
        body: JSON.stringify({ id: jobId }),
      });
      setStatus("Stopping…");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Stop failed");
    }
  }

  async function download(format: "csv" | "json") {
    if (!jobId) return;
    try {
      const res = await fetch(
        `${apiBase()}/api/scrape/apk/download?id=${encodeURIComponent(jobId)}&format=${format}`,
        { headers: { Authorization: `Bearer ${token()}` } },
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `androidapks_details.${format}`;
      a.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Download failed");
    }
  }

  const active = job?.status === "discovering" || job?.status === "running";
  const hasResults = (job?.success || 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold text-white">Get APK Scraper</h1>
          <p className="text-[12px] text-slate-500">
            Catalog limit ya specific app URL scrape
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
        >
          ← ALL Tools
        </button>
      </div>

      <section className="rounded-xl border border-white/[0.08] bg-white p-5 text-slate-900 shadow-sm">
        <h2 className="text-[18px] font-bold text-[#0f172a]">5. AndroidAPKs — Overall APK Scrape</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("catalog")}
            className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50 ${
              mode === "catalog"
                ? "bg-[#2f7bff] text-white"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Catalog (limit)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("custom")}
            className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50 ${
              mode === "custom"
                ? "bg-[#2f7bff] text-white"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Custom URL
          </button>
        </div>

        {mode === "catalog" ? (
          <>
            <label htmlFor="apk-website" className="mt-4 block text-[13px] font-medium text-slate-700">
              Website URL — sirf androidapks.com
            </label>
            <input
              id="apk-website"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
              className="mt-2 w-full rounded-lg border border-amber-400/80 bg-white px-3.5 py-3 text-[14px] outline-none ring-0 focus:border-[#2f7bff]"
              placeholder="https://androidapks.com/"
            />
            <label htmlFor="apk-limit" className="mt-4 block text-[13px] font-medium text-slate-700">
              Limit — kitne APKs scrape karni hain (blank = all)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                id="apk-limit"
                type="number"
                min={1}
                step={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                disabled={busy}
                className="w-36 rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-[14px] outline-none focus:border-[#2f7bff]"
                placeholder="100"
              />
              {LIMIT_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy}
                  onClick={() => setLimit(String(n))}
                  className={`rounded-lg border px-3 py-2 text-[12px] font-semibold disabled:opacity-50 ${
                    limit === String(n)
                      ? "border-[#2f7bff] bg-[#2f7bff]/10 text-[#1d4ed8]"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={busy}
                onClick={() => setLimit("")}
                className={`rounded-lg border px-3 py-2 text-[12px] font-semibold disabled:opacity-50 ${
                  limit === ""
                    ? "border-[#2f7bff] bg-[#2f7bff]/10 text-[#1d4ed8]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                All
              </button>
            </div>
          </>
        ) : (
          <>
            <label htmlFor="apk-custom-urls" className="mt-4 block text-[13px] font-medium text-slate-700">
              Custom app URL(s) — ek line pe ek, ya comma se
            </label>
            <textarea
              id="apk-custom-urls"
              rows={5}
              value={customUrls}
              onChange={(e) => setCustomUrls(e.target.value)}
              disabled={busy}
              className="mt-2 w-full rounded-lg border border-amber-400/80 bg-white px-3.5 py-3 font-mono text-[13px] outline-none focus:border-[#2f7bff]"
              placeholder={
                "https://androidapks.com/some-app/\nhttps://androidapks.com/another-app/"
              }
            />
            <p className="mt-2 text-[12px] text-slate-500">
              App details page URL do — download/APK file link nahi. Max 500 URLs.
            </p>
          </>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void start()}
            disabled={busy}
            className="rounded-lg bg-[#2f7bff] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#2563eb] disabled:opacity-50"
          >
            {mode === "custom" ? "Scrape Custom URL(s)" : "Scrape APK Details"}
          </button>
          {active ? (
            <button
              type="button"
              onClick={() => void stop()}
              disabled={job?.cancel}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Stop APK scraping
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-[13px] leading-5 text-slate-600" role="status">
          {status}
        </p>
        {job ? (
          <progress
            className="mt-3 h-2 w-full overflow-hidden rounded bg-slate-100 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-[#2f7bff] [&::-moz-progress-bar]:bg-[#2f7bff]"
            max={Math.max(job.total, 1)}
            value={job.processed}
          />
        ) : null}
        {active && job?.current ? (
          <p className="mt-2 break-all text-[12px] text-slate-500">{job.current}</p>
        ) : null}
        {hasResults ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void download("csv")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Download APK CSV
            </button>
            <button
              type="button"
              onClick={() => void download("json")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Download APK JSON
            </button>
          </div>
        ) : null}
        {job?.errors?.length ? (
          <details className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-800">
            <summary className="cursor-pointer font-semibold">
              APK failed links / errors ({job.errors.length})
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">
              {job.errors.map((e) => `${e.url}\n${e.error}`).join("\n\n")}
            </pre>
          </details>
        ) : null}
        <p className="mt-4 text-[12px] text-slate-500">
          Catalog mode sitemap se limit ke mutabiq apps scrape karta hai. Custom mode sirf di hui
          app page URL(s) scrape karta hai. APK binaries download nahi hongi.
        </p>
      </section>
    </div>
  );
}
