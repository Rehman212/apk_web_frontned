import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 7;
  let start = Math.max(1, page - 3);
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let n = start; n <= end; n++) pages.push(n);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" href={hrefFor(page - 1)}>
          Prev
        </Link>
      ) : (
        <span className="rounded-lg px-3 py-2 text-sm text-zinc-400">Prev</span>
      )}
      {start > 1 ? (
        <>
          <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" href={hrefFor(1)}>
            1
          </Link>
          {start > 2 ? <span className="px-1 text-zinc-400">…</span> : null}
        </>
      ) : null}
      {pages.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          className={
            n === page
              ? "rounded-lg bg-[#15c15d] px-3 py-2 text-sm font-bold text-white"
              : "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          }
        >
          {n}
        </Link>
      ))}
      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? <span className="px-1 text-zinc-400">…</span> : null}
          <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" href={hrefFor(totalPages)}>
            {totalPages}
          </Link>
        </>
      ) : null}
      {page < totalPages ? (
        <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" href={hrefFor(page + 1)}>
          Next
        </Link>
      ) : (
        <span className="rounded-lg px-3 py-2 text-sm text-zinc-400">Next</span>
      )}
    </nav>
  );
}
