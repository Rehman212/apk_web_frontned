import { ListingPage } from "@/components/ListingPage";
import { appsByKind, paginate, parsePage } from "@/lib/catalog";

export const metadata = {
  title: "Apps",
};

export default async function AppsPage({ searchParams }: PageProps<"/apps">) {
  const { page } = await searchParams;
  const listing = paginate(appsByKind("app"), parsePage(page));
  return (
    <ListingPage
      title="Android apps"
      subtitle="Communication, tools, music, photography, and productivity — 10 apps per page."
      items={listing.items}
      page={listing.page}
      totalPages={listing.totalPages}
      total={listing.total}
      hrefFor={(n) => `/apps?page=${n}`}
    />
  );
}
