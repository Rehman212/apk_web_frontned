"use client";

import { useRef } from "react";

const TINTS = ["#123c32", "#4a3118", "#3d2a6b", "#0e5c60"];

export function ShotGallery({
  name,
  shots,
  cover,
}: {
  name: string;
  shots: string[];
  cover?: string;
}) {
  const tiles = shots.slice(0, 4);
  if (!tiles.length && !cover) return null;
  const items = tiles.length ? tiles : [cover, cover, cover, cover];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
      {items.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`relative h-[150px] overflow-hidden rounded-2xl sm:h-[196px] ${
            i === 0 ? "col-span-2 sm:col-span-1" : ""
          }`}
          style={{ background: TINTS[i % TINTS.length] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover && !src?.includes("/api/promo/") ? src : cover || src}
            alt={`${name} preview ${i + 1}`}
            className={`h-full w-full ${
              src?.includes("/api/promo/") || src === cover ? "object-contain p-6 sm:p-8" : "object-cover"
            }`}
          />
          {i === 0 ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-[#2f6fed] shadow-[0_10px_28px_rgba(15,23,42,0.28)]">
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
                  <path d="M8 5.2v13.6L19 12 8 5.2z" />
                </svg>
              </span>
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ShotRail({
  name,
  shots,
  cover,
}: {
  name: string;
  shots: string[];
  cover?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const items = shots.length ? shots : [cover, cover, cover].filter(Boolean);

  function move(dir: number) {
    scroller.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => move(-1)}
        className="absolute top-1/2 left-1 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2f6fed] shadow-md sm:flex"
        aria-label="Previous screenshots"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4 6 10l6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        className="absolute top-1/2 right-1 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2f6fed] shadow-md sm:flex"
        aria-label="Next screenshots"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 4l6 6-6 6" />
        </svg>
      </button>
      <div ref={scroller} className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-1 pb-1">
        {items.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="h-[148px] w-[248px] shrink-0 overflow-hidden rounded-2xl"
            style={{ background: TINTS[i % TINTS.length] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover && src?.includes("/api/promo/") ? cover : src || cover}
              alt={`${name} screenshot ${i + 1}`}
              className={`h-full w-full ${src?.includes("/api/promo/") || src === cover ? "object-contain p-6" : "object-cover"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
