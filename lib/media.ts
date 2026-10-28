/** Upgrade CDN thumbs (winudf `w=140`, Play `=s128`, WP `-85x85`) so icons stay sharp. */
export function hdMediaUrl(raw?: string | null, size = 512): string | undefined {
  if (!raw) return undefined;
  if (raw.startsWith("/")) return raw;

  const next = raw
    .replace(/-\d{2,4}x\d{2,4}(?=\.(?:png|jpe?g|webp|gif))/i, "")
    .replace(/([?&]w=)\d+/i, `$1${size}`)
    .replace(/([?&]h=)\d+/i, `$1${size}`)
    .replace(/([?&]width=)\d+/i, `$1${size}`)
    .replace(/=s\d+(?:-[a-z]+)?/gi, `=s${size}`)
    .replace(/\/s\d+(-[a-z]+)?\//gi, `/s${size}$1/`);

  return next;
}

export function hdApp(app: {
  iconUrl?: string;
  screenshots?: string[];
}) {
  return {
    iconUrl: hdMediaUrl(app.iconUrl, 512) || app.iconUrl,
    screenshots: app.screenshots?.map((src) => hdMediaUrl(src, 720) || src),
  };
}
