/** Nest API origin. Strips trailing slash so `/api/...` never becomes `//api/...`. */
export function apiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  return raw.replace(/\/+$/, "");
}
