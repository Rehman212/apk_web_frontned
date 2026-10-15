export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-extrabold text-zinc-900">Contact</h1>
      <form className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <input className="w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="Your name" />
        <input className="w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="Email" />
        <textarea className="h-32 w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="Message" />
        <button type="button" className="w-full rounded-lg bg-[#2f7bff] py-2.5 font-bold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
