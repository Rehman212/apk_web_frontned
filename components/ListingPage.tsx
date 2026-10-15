import Link from "next/link";
import { AppRow } from "@/components/AppCard";
import { Pagination } from "@/components/Pagination";
import { categories, type StoreApp } from "@/lib/catalog";

export function ListingPage({
  title,
  subtitle,
  items,
  page,
  totalPages,
  total,
  hrefFor,
}: {
  title: string;
  subtitle: string;
  items: StoreApp[];
  page: number;
  totalPages: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  return (
    <div className="w-full px-3 py-8 sm:px-4">
      <h1 className="text-3xl font-extrabold text-zinc-900">{title}</h1>
      <p className="mt-2 text-zinc-600">{subtitle}</p>
      <p className="mt-2 text-sm text-zinc-500">
        {total.toLocaleString()} titles · 10 per page · page {page} of {totalPages}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:border-[#15c15d] hover:text-[#0ea24a]"
          >
            {category.emoji} {category.name}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((app) => (
          <AppRow key={app.slug} app={app} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  );
}
