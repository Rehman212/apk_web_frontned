"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slide) return null;

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <section className="w-full bg-[#07111f] px-3 pb-5 pt-3 sm:px-4">
      <div className="relative w-full overflow-hidden rounded-2xl">
        <div className="relative h-[220px] w-full sm:h-[260px] md:h-[300px] lg:h-[320px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#07111f_0%,rgba(7,17,31,.72)_28%,rgba(7,17,31,.18)_52%,transparent_72%)]" />

          <div className="relative z-10 flex h-full max-w-[480px] flex-col justify-center px-8 py-6 md:px-12">
            <span className="inline-flex w-fit rounded-md bg-[#2f7bff] px-3 py-1 text-[11px] font-bold text-white">
              {slide.badge}
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-1.5 text-base font-medium text-slate-200 sm:text-lg">{slide.subtitle}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{slide.description}</p>
            <Link
              href={slide.href}
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-[#2f7bff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2563eb]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 4v10" />
                <path d="m8 11 4 4 4-4" />
                <path d="M5 19h14" />
              </svg>
              Download Now
            </Link>
          </div>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl leading-none text-white hover:bg-black/50 md:left-2"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl leading-none text-white hover:bg-black/50 md:right-2"
                aria-label="Next slide"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {slides.map((item, i) => (
                  <button
                    key={item.href + item.image}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full ${
                      i === index ? "w-6 bg-[#2f7bff]" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
