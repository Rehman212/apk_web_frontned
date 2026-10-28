"use client";

import { useCallback, useEffect, useState } from "react";
import { apiBase } from "@/lib/apiBase";
import { HOME_SECTIONS, sectionName } from "@/lib/homeSections";

type SectionCount = { slug: string; name: string; count: number };

function token() {
  return window.localStorage.getItem("modplays-token") || window.sessionStorage.getItem("modplays-token") || "";
}

export function CategoriesPanel({ onBack }: { onBack: () => void }) {
  const [sections, setSections] = useState<SectionCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase()}/api/apps/sections`, {
        headers: { Authorization: `Bearer ${token()}` },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as { sections?: SectionCount[] };
      if (res.ok && Array.isArray(data.sections)) setSections(data.sections);
      else {
        setSections(HOME_SECTIONS.map((s) => ({ ...s, count: 0 })));
      }
    } catch {
      setSections(HOME_SECTIONS.map((s) => ({ ...s, count: 0 })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function assignRandom() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${apiBase()}/api/apps/assign-random`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        updated?: number;
        sections?: SectionCount[];
        message?: string;
      };
      if (!res.ok) {
        setMsg(data.message || "Failed");
        return;
      }
      if (data.sections) setSections(data.sections);
      setMsg(`Randomly assigned ${data.updated ?? 0} tools across categories.`);
    } catch {
      setMsg("Cannot reach backend.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-semibold text-white">Categories</h1>
          <p className="text-[12px] text-slate-500">Homepage sections from store images</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void assignRandom()}
            className="rounded-md bg-white/[0.08] px-2.5 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
          >
            {busy ? "Assigning…" : "Random assign all"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
          >
            ← ALL Tools
          </button>
        </div>
      </div>

      {msg ? <p className="text-[12px] text-emerald-400">{msg}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(loading ? HOME_SECTIONS.map((s) => ({ ...s, count: 0 })) : sections).map((s) => (
          <div key={s.slug} className="rounded-lg border border-white/[0.06] bg-[#121820] p-3.5">
            <p className="text-[13px] font-medium text-white">{s.name || sectionName(s.slug)}</p>
            <p className="mt-1 font-mono text-[11px] text-slate-600">{s.slug}</p>
            <p className="mt-3 text-xl font-semibold tabular-nums text-white">{loading ? "…" : s.count}</p>
            <p className="text-[11px] text-slate-500">tools assigned</p>
          </div>
        ))}
      </div>
    </>
  );
}
