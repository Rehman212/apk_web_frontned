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
  errors: { url: string; error: string }[];
  message?: string;
};

export function ApkScraperTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState("https://androidapks.com/");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("AndroidAPKs ke app sitemaps se overall details scrape karein.");
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
    const res = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
        ...(init?.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        Array.isArray((data as { message?: string }).message)
          ? (data as { message: string[] }).message[0]
          : (data as { message?: string }).message || "Request failed",
      );
    }
    return data;
  }

  async function poll(id: string) {
    try {
      const data = (await api(`/api/scrape/apk/status?id=${encodeURIComponent(id)}`)) as JobStatus;
      setJob(data);
      const active = data.status === "discovering" || data.status === "running";
      setBusy(active);
      setStatus(
        `${data.status.replaceAll("_", " ")} · ${data.total} app links found · ${data.processed} processed · ${data.success} apps scraped · ${data.skipped || 0} other pages skipped · ${data.errors.length} errors`,
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
      const data = (await api("/api/scrape/apk/start", {
        method: "POST",
        body: JSON.stringify({ url: url.trim() }),
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
          <p className="text-[12px] text-slate-500">AndroidAPKs overall catalog scrape</p>
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
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void start()}
            disabled={busy}
            className="rounded-lg bg-[#2f7bff] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#2563eb] disabled:opacity-50"
          >
            Scrape All APK Details
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
          AndroidAPKs ke app sitemaps se overall details scrape karein. App details, versions, package
          names, icons, screenshots aur download-page links. APK binaries download nahi hongi.
        </p>
      </section>
    </div>
  );
}
