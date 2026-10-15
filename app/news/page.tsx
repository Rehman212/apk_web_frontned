import { news } from "@/lib/catalog";

export const metadata = {
  title: "News",
};

export default function NewsPage() {
  return (
    <div className="w-full px-3 py-8 sm:px-4">
      <h1 className="text-3xl font-extrabold text-zinc-900">News & topics</h1>
      <p className="mt-2 text-zinc-600">Guides and highlights from the catalog — same role as a store blog.</p>
      <div className="mt-8 space-y-6">
        {news.map((item) => (
          <article key={item.slug} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs font-medium text-zinc-500">{item.date}</p>
            <h2 className="mt-2 text-xl font-bold text-zinc-900">{item.title}</h2>
            <p className="mt-3 leading-7 text-zinc-700">{item.excerpt}</p>
            <p className="mt-4 text-sm text-zinc-500">
              This is a demo article body. In a production store you would publish full reviews, changelogs,
              and safety notes for each title.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
