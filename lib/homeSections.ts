export const HOME_SECTIONS = [
  { slug: "latest-updates", name: "Latest Updates" },
  { slug: "popular-games", name: "Popular Games" },
  { slug: "popular-apps", name: "Popular Apps" },
  { slug: "recommended-tools", name: "Recommended Tools" },
  { slug: "new-games", name: "New Games" },
  { slug: "editors-choice", name: "Editors' Choice" },
] as const;

export type HomeSectionSlug = (typeof HOME_SECTIONS)[number]["slug"];

export function sectionName(slug?: string | null) {
  return HOME_SECTIONS.find((s) => s.slug === slug)?.name ?? slug ?? "—";
}
