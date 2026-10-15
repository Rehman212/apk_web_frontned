import { ListingPage } from "@/components/ListingPage";
import { appsByCategory, paginate, parsePage } from "@/lib/catalog";

export const metadata = {
  title: "Tools",
};

export default async function ToolsPage({ searchParams }: PageProps<"/tools">) {
  const { page } = await searchParams;
  const listing = paginate(appsByCategory("tools"), parsePage(page));
  return (
    <ListingPage
      title="Android tools"
      subtitle="Real F-Droid utilities, 10 per page, with official icons and APKs."
      items={listing.items}
      page={listing.page}
      totalPages={listing.totalPages}
      total={listing.total}
      hrefFor={(n) => `/tools?page=${n}`}
    />
  );
}
