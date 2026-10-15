export const metadata = { title: "Request" };

export default function RequestPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-extrabold text-zinc-900">Request an app</h1>
      <p className="mt-2 text-sm text-zinc-600">Ask for an open-source title to be highlighted in the catalog.</p>
      <form className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <input className="w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="App name" />
        <input className="w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="Package or source URL" />
        <button type="button" className="w-full rounded-lg bg-[#2f7bff] py-2.5 font-bold text-white">
          Submit request
        </button>
      </form>
    </div>
  );
}
