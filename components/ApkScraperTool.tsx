"use client";

import { useRef, useState } from "react";
import { apiBase } from "@/lib/apiBase";
import { scrapedAppsToCsv, type ScrapedApp } from "@/lib/scrapeExport";

function token() {
  return (
    window.localStorage.getItem("modplays-token") ||
    window.sessionStorage.getItem("modplays-token") ||
    ""
  );
}

type BatchResult = {
  products?: ScrapedApp[];
  remaining?: string[];
  total?: number;
  skipped?: number;
  done?: boolean;
  errors?: { url: string; error: string }[];
  message?: string | string[];
};

type ScrapeMode = "catalog" | "custom";

const LIMIT_PRESETS = [50, 100, 200, 500, 1000] as const;

export function ApkScraperTool({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<ScrapeMode>("catalog");
  const [url, setUrl] = useState("https://androidapks.com/");
  const [customUrls, setCustomUrls] = useState("");
  const [limit, setLimit] = useState("100");
  const [status, setStatus] = useState(
    "Catalog scrape batches mein chalta hai — 100+ apps ke liye limit set karke Scrape dabao.",
  );
  const [busy, setBusy] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [products, setProducts] = useState<ScrapedApp[]>([]);
  const [errors, setErrors] = useState<{ url: string; error: string }[]>([]);
  const cancelRef = useRef(false);

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
      throw new Error(msg || `Request failed (${res.status})`);
    }
    return data;
  }

  async function start() {
    cancelRef.current = false;
    setBusy(true);
    setProducts([]);
    setErrors([]);
    setProcessed(0);
    setSkipped(0);
    setTotal(0);

    try {
      let queue: string[] | undefined;
      let catalogLimit: number | undefined;
      let website = url.trim() || "https://androidapks.com/";

      if (mode === "custom") {
        const urls = customUrls
          .split(/[\n,]+/)
          .map((u) => u.trim())
          .filter(Boolean);
        if (!urls.length) throw new Error("Kam az kam ek androidapks.com app page URL likho.");
        for (const u of urls) {
          const parsed = new URL(u);
          const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
          if (!(host === "androidapks.com" || host.endsWith(".androidapks.com"))) {
            throw new Error(`Sirf androidapks.com URLs allowed: ${u}`);
          }
        }
        queue = urls;
        website = urls[0];
        setTotal(urls.length);
        setStatus(`Custom scrape · ${urls.length} URLs`);
      } else {
        const trimmed = limit.trim();
        catalogLimit = trimmed === "" ? undefined : Number(trimmed);
        if (catalogLimit !== undefined && (!Number.isFinite(catalogLimit) || catalogLimit < 1)) {
          throw new Error("Limit 1 ya us se zyada number likho, ya blank chhor do for all.");
        }
        setStatus(
          catalogLimit
            ? `Catalog discover + scrape · limit ${catalogLimit}`
            : "Catalog discover + scrape · all (batches)",
        );
      }

      const all: ScrapedApp[] = [];
      const allErrors: { url: string; error: string }[] = [];
      let skip = 0;
      let seen = 0;
      let queuedTotal = mode === "custom" ? queue?.length || 0 : 0;

      while (!cancelRef.current) {
        const data = (await api("/api/scrape/apk/batch", {
          method: "POST",
          body: JSON.stringify({
            mode,
            url: website,
            limit: catalogLimit,
            urls: queue,
          }),
        })) as BatchResult;

        const batch = Array.isArray(data.products) ? data.products : [];
        all.push(...batch);
        skip += data.skipped || 0;
        const thisRound =
          (data.products?.length || 0) + (data.skipped || 0) + (data.errors?.length || 0);
        seen += thisRound;
        if (data.errors?.length) allErrors.push(...data.errors);
        queue = data.remaining || [];
        if (!queuedTotal) queuedTotal = data.total || seen + queue.length;

        setProducts([...all]);
        setErrors([...allErrors]);
        setSkipped(skip);
        setProcessed(seen);
        setTotal(queuedTotal);
        setStatus(
          `${cancelRef.current ? "stopping" : queue.length ? "running" : "completed"} · ${all.length} apps scraped · ${seen} processed · ${skip} skipped · ${allErrors.length} errors · ${queue.length} remaining`,
        );

        if (data.done || !queue.length) break;
      }

      setBusy(false);
      if (cancelRef.current) {
        setStatus((s) => s.replace(/^running/, "cancelled"));
      }
    } catch (err) {
      setBusy(false);
      setStatus(err instanceof Error ? err.message : "Start failed");
    }
  }

  function stop() {
    cancelRef.current = true;
    setStatus("Stopping after current batch…");
  }

  function download(format: "csv" | "json") {
    if (!products.length) return;
    const body =
      format === "csv" ? scrapedAppsToCsv(products) : JSON.stringify(products, null, 2);
    const blob = new Blob([body], {
      type: format === "csv" ? "text/csv;charset=utf-8" : "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `androidapks_details.${format}`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold text-white">Get APK Scraper</h1>
          <p className="text-[12px] text-slate-500">
            Batches mein scrape — 50/100/200+ chalega, CSV seedha import-ready
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
              Limit — kitne APKs scrape karni hain (blank = all, batches mein)
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
              placeholder={"https://tekken-8.androidapks.com/\nhttps://instagram.androidapks.com/"}
            />
            <p className="mt-2 text-[12px] text-slate-500">
              Subdomain app pages chalenge, jaise{" "}
              <span className="font-mono text-slate-700">https://tekken-8.androidapks.com/</span>. Max 500 URLs.
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
          {busy ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Stop APK scraping
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-[13px] leading-5 text-slate-600" role="status">
          {status}
        </p>
        {total > 0 || processed > 0 ? (
          <progress
            className="mt-3 h-2 w-full overflow-hidden rounded bg-slate-100 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-[#2f7bff] [&::-moz-progress-bar]:bg-[#2f7bff]"
            max={Math.max(total, processed, 1)}
            value={processed}
          />
        ) : null}
        {products.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => download("csv")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Download APK CSV
            </button>
            <button
              type="button"
              onClick={() => download("json")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              Download APK JSON
            </button>
          </div>
        ) : null}
        {errors.length ? (
          <details className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-800">
            <summary className="cursor-pointer font-semibold">
              APK failed links / errors ({errors.length})
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">
              {errors.map((e) => `${e.url}\n${e.error}`).join("\n\n")}
            </pre>
          </details>
        ) : null}
        <p className="mt-4 text-[12px] text-slate-500">
          Har request 5 apps scrape karti hai taake Vercel timeout na ho. CSV Upload CSV tool ke columns
          se match karti hai. APK binaries download nahi hongi.
        </p>
      </section>
    </div>
  );
}
