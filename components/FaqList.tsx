"use client";

import { useState } from "react";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(-1);

  return (
    <div className="divide-y divide-[#e8eef6]">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(on ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              {item.q}
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 shrink-0 text-zinc-400 transition ${on ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M5 7.5 10 12.5 15 7.5" />
              </svg>
            </button>
            {on ? <p className="px-4 pb-4 text-sm leading-6 text-zinc-600">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
