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

export function heroBannerSvg(app: Pick<StoreApp, "slug" | "name" | "letter" | "kind" | "iconUrl">) {
  const [a, b] = paletteFor(app.slug);
  const letter = escapeXml((app.letter || app.name[0] || "A").slice(0, 1));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="360" viewBox="0 0 420 360">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#141b33"/>
      <stop offset=".5" stop-color="#3a2458"/>
      <stop offset="1" stop-color="#f4b86a"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6c8a4"/>
      <stop offset="1" stop-color="#d9996c"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f5f7fb" stop-opacity="1"/>
      <stop offset=".28" stop-color="#f5f7fb" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="420" height="360" fill="url(#sky)"/>
  <circle cx="48" cy="42" r="2" fill="#fff" opacity=".7"/>
  <circle cx="90" cy="28" r="1.6" fill="#fff" opacity=".5"/>
  <circle cx="130" cy="54" r="2" fill="#fff" opacity=".6"/>
  <rect x="8" y="210" width="28" height="90" fill="#101827"/>
  <rect x="42" y="188" width="22" height="112" fill="#1b2a40"/>
  <rect x="70" y="200" width="34" height="100" fill="#152033"/>
  <rect x="110" y="176" width="24" height="124" fill="#1a2740"/>
  <ellipse cx="36" cy="248" rx="16" ry="70" fill="#0b1220"/>
  <ellipse cx="36" cy="176" rx="22" ry="12" fill="#111827"/>
  <g transform="translate(118,8)">
    <ellipse cx="128" cy="328" rx="86" ry="14" fill="#000" opacity=".16"/>
    <path d="M70 168c28-54 108-58 138-8l22 88c10 40-6 78-48 90l-96 10c-40-16-46-72-16-180z" fill="url(#shirt)"/>
    <path d="M72 118c12-42 86-52 108-4 8 18 2 42-18 52-30 14-80 6-90-16z" fill="url(#skin)"/>
    <path d="M68 102c22-48 118-50 128 10 2 18-10 30-28 34l-92 4c-14-6-16-24-8-48z" fill="#111827"/>
    <path d="M64 108c30-16 102-20 122 8 6 8 0 14-10 12-36-8-88-6-112 4-8 2-10-8 0-24z" fill="#ef4444"/>
    <circle cx="186" cy="108" r="9" fill="#f8fafc"/>
    <path d="M154 128c16 10 30 10 46 0" stroke="#7c4a2d" stroke-width="3" fill="none"/>
    <path d="M196 186c48 20 74 74 52 120l-48 8c-6-40-26-72-64-86z" fill="url(#shirt)"/>
    <path d="M228 292c18 8 20 28 6 40-28 16-60 6-68-16 16-16 40-28 62-24z" fill="#111827"/>
    <path d="M78 308c-8 20 8 38 32 36 22-2 32-20 24-36-16-4-40-4-56 0z" fill="#111827"/>
    <rect x="108" y="214" width="52" height="52" rx="14" fill="#fff"/>
    <text x="134" y="250" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="24" fill="${b}">${letter}</text>
  </g>
  <rect width="90" height="360" fill="url(#fade)"/>
</svg>`;
}

export function promoShotSvg(
  app: Pick<StoreApp, "slug" | "name" | "letter" | "kind" | "iconUrl">,
  frame: number,
) {
  const [a, b] = paletteFor(app.slug + String(frame));
  const [c, d] = paletteFor(app.slug + "alt" + String(frame));
  const icon = app.iconUrl ? escapeXml(app.iconUrl) : "";
  const mark = icon
    ? `<image href="${icon}" x="248" y="78" width="144" height="144" preserveAspectRatio="xMidYMid meet"/>`
    : `<circle cx="320" cy="150" r="58" fill="#fff" opacity=".2"/>`;
  const scenes = [
    `<rect width="640" height="360" fill="${b}"/>
     <circle cx="520" cy="40" r="150" fill="${a}" opacity=".45"/>
     <circle cx="60" cy="320" r="160" fill="${c}" opacity=".4"/>`,
    `<rect width="640" height="360" fill="${d}"/>
     <path d="M0 220 Q200 90 360 200 T640 150 V360 H0z" fill="${a}" opacity=".7"/>
     <circle cx="96" cy="70" r="46" fill="#fde68a"/>`,
    `<rect width="640" height="360" fill="${a}"/>
     <rect x="40" y="40" width="180" height="280" rx="28" fill="#000" opacity=".12"/>
     <rect x="420" y="50" width="180" height="260" rx="28" fill="#000" opacity=".12"/>`,
    `<rect width="640" height="360" fill="${c}"/>
     <circle cx="320" cy="180" r="150" fill="${b}" opacity=".28"/>`,
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  ${scenes[frame % scenes.length]}
  ${mark}
</svg>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
