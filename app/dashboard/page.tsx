import { AdminDashboard } from "@/components/AdminDashboard";
import { allApps, appsByKind, categories, getCategory } from "@/lib/catalog";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const apps = allApps();
  const games = appsByKind("game").length;
  const applications = appsByKind("app").length;
  const withApk = apps.filter((app) => Boolean(app.apkUrl)).length;
  const withIcon = apps.filter((app) => Boolean(app.iconUrl)).length;
  const withShots = apps.filter((app) => (app.screenshots?.length ?? 0) > 0).length;
  const featured = apps.filter((app) => app.featured).length;
  const hot = apps.filter((app) => app.hot).length;
  const isNew = apps.filter((app) => app.isNew).length;

  const byCategory = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      emoji: category.emoji,
      kind: category.kind,
      count: apps.filter((app) => app.category === category.slug).length,
    }))
    .sort((a, b) => b.count - a.count);

  const weekBars = Array.from({ length: 12 }, (_, i) => {
    const seed = 42 + i * 17;
    const base = Math.round(apps.length / 14 + ((seed * 13) % 90));
    return { label: `W${i + 1}`, value: base };
  });

  return (
    <AdminDashboard
      catalog={{
        catalog: apps.length,
        games,
        applications,
        categories: categories.length,
        featured,
        hot,
        isNew,
        withApk,
        withIcon,
        withShots,
        apkCoverage: Math.round((withApk / Math.max(apps.length, 1)) * 100),
        iconCoverage: Math.round((withIcon / Math.max(apps.length, 1)) * 100),
        shotCoverage: Math.round((withShots / Math.max(apps.length, 1)) * 100),
        byCategory,
        weekBars,
        top: apps.slice(0, 24).map((app) => ({
          slug: app.slug,
          name: app.name,
          kind: app.kind,
          category: app.category,
          categoryName: getCategory(app.category)?.name ?? app.category,
          version: app.version,
          developer: app.developer,
          letter: app.letter,
          accent: app.accent,
          hasApk: Boolean(app.apkUrl),
          featured: Boolean(app.featured),
        })),
      }}
    />
  );
}
