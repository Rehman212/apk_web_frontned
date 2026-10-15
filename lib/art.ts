import type { StoreApp } from "@/lib/catalog";

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PALETTES = [
  ["#15c15d", "#064e3b"],
  ["#0ea5e9", "#1e3a8a"],
  ["#f59e0b", "#7c2d12"],
  ["#a855f7", "#3b0764"],
  ["#ef4444", "#7f1d1d"],
  ["#14b8a6", "#134e4a"],
  ["#f97316", "#9a3412"],
  ["#6366f1", "#312e81"],
  ["#22c55e", "#14532d"],
  ["#e11d48", "#881337"],
];

export function paletteFor(slug: string) {
  return PALETTES[hash(slug) % PALETTES.length];
}

function glyph(kind: number) {
  const paths = [
    "M18 32h28v6H18zm6-14h16v8H24zM20 52h24l-4 12H24z",
    "M24 18l20 14-20 14V18zm4 8.5v11L36 32z",
    "M16 44c8-18 24-18 32 0-8 4-24 4-32 0zM32 18a8 8 0 110 16 8 8 0 010-16z",
    "M18 20h28v6H18zm0 10h28v22H18z",
    "M20 22h24v6H20zm-2 10h28v20H18zM28 20h8v6h-8z",
    "M16 30h32v6H16zm8-12h16v10H24zm0 20h16v16H24z",
    "M32 16l16 28H16z",
    "M18 18h28v28H18zm6 6v16h16V24z",
  ];
  return paths[kind % paths.length];
}

export function iconSvg(app: Pick<StoreApp, "slug" | "name" | "letter">) {
  const [a, b] = paletteFor(app.slug);
  const g = glyph(hash(app.slug));
  const letter = (app.letter || app.name[0] || "A").slice(0, 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <path d="${g}" fill="rgba(255,255,255,.22)"/>
  <text x="32" y="40" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">${escapeXml(letter)}</text>
</svg>`;
}

export function screenshotSvg(
  app: Pick<StoreApp, "slug" | "name" | "short" | "developer">,
  frame: number,
) {
  const [a, b] = paletteFor(app.slug + String(frame));
  const labels = ["Home", "Tools", "Files", "Settings"];
  const title = labels[frame % labels.length];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="760" viewBox="0 0 360 760">
  <rect width="360" height="760" rx="36" fill="#0b1220"/>
  <rect x="12" y="12" width="336" height="736" rx="28" fill="#f8fafc"/>
  <rect x="12" y="12" width="336" height="92" rx="28" fill="url(#bg)"/>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <text x="180" y="68" text-anchor="middle" fill="#fff" font-size="22" font-family="Arial, sans-serif" font-weight="700">${escapeXml(app.name)}</text>
  <rect x="36" y="128" width="288" height="54" rx="14" fill="#e2e8f0"/>
  <text x="52" y="162" fill="#334155" font-size="16" font-family="Arial, sans-serif">${escapeXml(title)} screen</text>
  ${[0, 1, 2, 3, 4].map((row) => {
    const y = 210 + row * 88;
    return `<rect x="36" y="${y}" width="288" height="72" rx="16" fill="#fff" stroke="#e2e8f0"/>
      <circle cx="76" cy="${y + 36}" r="18" fill="${a}"/>
      <text x="108" y="${y + 32}" fill="#0f172a" font-size="15" font-family="Arial, sans-serif" font-weight="700">Tool ${row + 1 + frame * 5}</text>
      <text x="108" y="${y + 52}" fill="#64748b" font-size="12" font-family="Arial, sans-serif">${escapeXml(app.developer)}</text>`;
  }).join("")}
  <text x="180" y="700" text-anchor="middle" fill="#64748b" font-size="12" font-family="Arial, sans-serif">${escapeXml(app.short.slice(0, 42))}</text>
</svg>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
