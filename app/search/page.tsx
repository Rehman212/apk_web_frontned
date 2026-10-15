import { AppRow } from "@/components/AppCard";
import { Pagination } from "@/components/Pagination";
import { paginate, parsePage, searchApps } from "@/lib/catalog";

export const metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const results = searchApps(query);
  const listing = paginate(results, parsePage(page));

  return (
    <div className="w-full px-3 py-8 sm:px-4">
      <h1 className="text-3xl font-extrabold text-zinc-900">Search</h1>
      <p className="mt-2 text-zinc-600">
        {query
          ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”`
          : "Type a name in the header search to find apps and games."}
      </p>
      <div className="mt-6 grid gap-3">
        {listing.items.map((app) => (
          <AppRow key={app.slug} app={app} />
        ))}
      </div>
      <Pagination
        page={listing.page}
        totalPages={listing.totalPages}
        hrefFor={(n) => `/search?q=${encodeURIComponent(query)}&page=${n}`}
      />
    </div>
  );
}
