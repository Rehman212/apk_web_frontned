import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-zinc-900">Page not found</h1>
      <p className="mt-3 text-zinc-600">That app or category is not in the catalog.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-[#15c15d] px-6 py-3 font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}
