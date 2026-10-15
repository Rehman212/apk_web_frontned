import Link from "next/link";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef3f8] px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
        <h1 className="text-2xl font-black text-slate-900">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we&apos;ll send reset instructions if an account exists.
        </p>
        <form className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="you@email.com"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#2f7bff] focus:ring-2 focus:ring-[#2f7bff]/20"
          />
          <button type="button" className="w-full rounded-xl bg-[#2f7bff] py-3 text-sm font-bold text-white">
            Send reset link
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href="/login" className="font-bold text-[#2f7bff]">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
