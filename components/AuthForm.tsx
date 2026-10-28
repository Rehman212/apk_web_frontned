"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiBase } from "@/lib/apiBase";

type FieldErrors = Record<string, string>;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  function validate() {
    const next: FieldErrors = {};
    if (!isEmail(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;
    setErrors({});
    setBusy(true);
    try {
      const res = await fetch(`${apiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string | string[];
        user?: { id: string; name: string; email: string; role: string };
        token?: string;
      };
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        setErrors({ form: msg || "Request failed. Is the backend running?" });
        setBusy(false);
        return;
      }
      if (!data.user || !data.token) {
        setErrors({ form: "Unexpected response from server." });
        setBusy(false);
        return;
      }
      const store = remember ? window.localStorage : window.sessionStorage;
      store.setItem("modplays-user", JSON.stringify(data.user));
      store.setItem("modplays-token", data.token);
      window.dispatchEvent(new Event("modplays-auth"));
      setNotice("Welcome back. Opening dashboard…");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ form: "Cannot reach the API. Start the Nest backend on port 4000." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {notice ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      ) : null}
      {errors.form ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Admin email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          className={inputClass(errors.email)}
          placeholder="yasir@gmail.com"
        />
        <FieldError message={errors.email} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            className={`${inputClass(errors.password)} pr-20`}
            placeholder="Admin password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2f7bff]"
            onClick={() => setShowPass((v) => !v)}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        <FieldError message={errors.password} />
      </label>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-[#2f7bff]"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-[#2f7bff] hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-[#2f7bff] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2563eb] disabled:opacity-60"
      >
        {busy ? "Please wait…" : "Sign in to dashboard"}
      </button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function inputClass(error?: string) {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ${
    error
      ? "border-red-400 ring-2 ring-red-100"
      : "border-slate-200 focus:border-[#2f7bff] focus:ring-2 focus:ring-[#2f7bff]/20"
  }`;
}
