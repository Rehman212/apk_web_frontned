import { notFound } from "next/navigation";
import { ListingPage } from "@/components/ListingPage";
import { appsByCategory, categories, getCategory, paginate, parsePage } from "@/lib/catalog";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  return { title: category ? category.name : "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = getCategory(slug);
  if (!category) notFound();
  const listing = paginate(appsByCategory(slug), parsePage(page));

  return (
    <ListingPage
      title={category.name}
      subtitle={`Browse ${category.name.toLowerCase()} titles — 10 per page.`}
      items={listing.items}
      page={listing.page}
      totalPages={listing.totalPages}
      total={listing.total}
      hrefFor={(n) => `/category/${slug}?page=${n}`}
    />
  );
}
