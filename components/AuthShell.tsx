import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export function AuthShell() {
  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-[#07111f] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/hero-city.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/70 to-[#07111f]/30" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
            <Link href="/" className="mb-auto text-2xl font-black tracking-wide">
              MOD<span className="text-[#3b9eff]">PLAYS</span>
            </Link>
            <p className="max-w-md text-3xl font-black leading-tight">Admin console for the ModPlays catalog.</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Sign in with the store administrator account to review catalog stats, health, and recent titles.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-[#2f7bff]">Administrator</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Admin login</h1>
            <p className="mt-1 text-sm text-slate-500">Only the store admin can access this panel. Public signup is disabled.</p>
            <div className="mt-6">
              <AuthForm />
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              <Link href="/" className="font-semibold text-[#2f7bff] hover:underline">
                Back to store
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
