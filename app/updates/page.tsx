import { ListingPage } from "@/components/ListingPage";
import { allApps, paginate, parsePage } from "@/lib/catalog";

export const metadata = { title: "New Updates" };

export default async function UpdatesPage({ searchParams }: PageProps<"/updates">) {
  const { page } = await searchParams;
  const listing = paginate(allApps(), parsePage(page));
  return (
    <ListingPage
      title="New updates"
      subtitle="Recently listed F-Droid titles, 10 per page."
      items={listing.items}
      page={listing.page}
      totalPages={listing.totalPages}
      total={listing.total}
      hrefFor={(n) => `/updates?page=${n}`}
    />
  );
}
