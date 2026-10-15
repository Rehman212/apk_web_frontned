import { ListingPage } from "@/components/ListingPage";
import { appsByKind, paginate, parsePage } from "@/lib/catalog";

export const metadata = {
  title: "Games",
};

export default async function GamesPage({ searchParams }: PageProps<"/games">) {
  const { page } = await searchParams;
  const listing = paginate(appsByKind("game"), parsePage(page));
  return (
    <ListingPage
      title="Android games"
      subtitle="Action, racing, puzzles, sports, and more — 10 games per page."
      items={listing.items}
      page={listing.page}
      totalPages={listing.totalPages}
      total={listing.total}
      hrefFor={(n) => `/games?page=${n}`}
    />
  );
}
