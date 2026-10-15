"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { categories } from "@/lib/catalog";

function CrownIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" aria-hidden>
      <path
        d="M8 34h32l-2.5-16-8.5 8-5-14-5 14-8.5-8L8 34z"
        fill="#3b9eff"
      />
      <path d="M10 36h28v4H10z" fill="#3b9eff" />
      <circle cx="8.5" cy="16" r="3.2" fill="#5eb0ff" />
      <circle cx="24" cy="9" r="3.2" fill="#5eb0ff" />
      <circle cx="39.5" cy="16" r="3.2" fill="#5eb0ff" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.4-3.2 3.8-4.8 7-4.8s5.6 1.6 7 4.8" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 3.2 3 11h2.2v8.2h5.2v-5h3.2v5h5.2V11H21L12 3.2z" />
    </svg>
  );
}

function IconGames() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M7 8h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 8zm2.2 3.2v1.6H7.8v1.6H6.2v-1.6H4.6v-1.6h1.6V9.6h1.6v1.6h1.6zm8.6.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 2.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm4-2.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-.7 11.2a1.5 1.5 0 0 1-1.5 1.4H8.2a1.5 1.5 0 0 1-1.5-1.4L6 8z" />
      <path d="M9 8V6.6A3 3 0 0 1 12 3.6 3 3 0 0 1 15 6.6V8" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14M5 12h14M5 17h10" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.2l2.5 1.6" />
    </svg>
  );
}

function IconBlog() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconRequest() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 19V6.5A1.5 1.5 0 0 1 6.5 5H14l5 5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19z" />
      <path d="M14 5v5h5M8 13h8M8 16h5" />
    </svg>
  );
}

const nav = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/games", label: "Games", icon: IconGames },
  { href: "/apps", label: "Apps", icon: IconBag },
  { href: "/tools", label: "Mod Menu", icon: IconMenu },
  { href: "/updates", label: "New Updates", icon: IconClock },
  { href: "/news", label: "Blog", icon: IconBlog },
  { href: "/request", label: "Request", icon: IconRequest },
  { href: "/contact", label: "Contact", icon: IconMail },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    function readUser() {
      try {
        const raw = window.localStorage.getItem("modplays-user") || window.sessionStorage.getItem("modplays-user");
        setUser(raw ? (JSON.parse(raw) as { name: string; email: string }) : null);
      } catch {
        setUser(null);
      }
    }
    readUser();
    window.addEventListener("modplays-auth", readUser);
    return () => window.removeEventListener("modplays-auth", readUser);
  }, []);

  function logout() {
    window.localStorage.removeItem("modplays-user");
    window.localStorage.removeItem("modplays-token");
    window.sessionStorage.removeItem("modplays-user");
    window.sessionStorage.removeItem("modplays-token");
    setUser(null);
    window.dispatchEvent(new Event("modplays-auth"));
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 bg-[#07111f] text-white shadow-lg">
      <div className="flex w-full items-center gap-3 px-3 py-2.5 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <CrownIcon />
          <span className="text-[22px] font-black tracking-wide">
            MOD<span className="text-[#3b9eff]">PLAYS</span>
          </span>
        </Link>

        <form onSubmit={onSearch} className="hidden min-w-0 flex-1 items-center md:flex">
          <div className="flex w-full overflow-hidden rounded-lg bg-[#132033] ring-1 ring-white/10">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for games, apps, mods..."
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="flex h-11 w-12 items-center justify-center bg-[#2f7bff] text-white hover:bg-[#2563eb]"
              aria-label="Search"
            >
              <IconSearch />
            </button>
          </div>
        </form>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Theme"
          >
            <IconMoon />
          </button>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#2f7bff] px-4 py-2 text-sm font-bold hover:bg-[#2563eb]"
              >
                Dashboard
              </Link>
              <span className="max-w-[140px] truncate text-sm text-slate-200">{user.name}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2f7bff] px-4 py-2 text-sm font-bold hover:bg-[#2563eb]"
            >
              <IconUser />
              Admin
            </Link>
          )}
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 hover:bg-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <IconMenu />
        </button>
      </div>

      <nav className="hidden border-t border-white/10 bg-[#0a1628] md:block">
        <div className="flex w-full items-stretch gap-1 overflow-x-auto px-2 sm:px-3">
          {nav.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold ${
                  active
                    ? "border-b-2 border-[#3b9eff] bg-[#132033] text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              className={`flex h-full items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold ${
                pathname.startsWith("/category")
                  ? "border-b-2 border-[#3b9eff] bg-[#132033] text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setCats((v) => !v)}
            >
              <IconGrid />
              Categories
              <span className="text-[10px]">▾</span>
            </button>
            {cats ? (
              <div className="absolute left-0 top-full z-50 grid w-[420px] grid-cols-2 gap-1 rounded-b-xl bg-[#132033] p-3 text-slate-100 shadow-2xl ring-1 ring-white/10">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="rounded-lg px-3 py-2 text-sm hover:bg-[#2f7bff]/20"
                    onClick={() => setCats(false)}
                  >
                    {category.emoji} {category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {nav.slice(3).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold ${
                  active
                    ? "border-b-2 border-[#3b9eff] bg-[#132033] text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {open ? (
        <div className="space-y-3 border-t border-white/10 bg-[#0a1628] px-4 py-3 md:hidden">
          <form onSubmit={onSearch} className="flex overflow-hidden rounded-lg bg-[#132033]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for games, apps, mods..."
              className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="bg-[#2f7bff] px-3" aria-label="Search">
              <IconSearch />
            </button>
          </form>
          <div className="flex gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-lg bg-[#2f7bff] py-2 text-center text-sm font-bold"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-white/10 py-2 text-sm"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex-1 rounded-lg bg-[#2f7bff] py-2 text-center text-sm font-bold"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded bg-white/5 px-2 py-2"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="rounded bg-white/5 px-2 py-1.5 text-sm"
                onClick={() => setOpen(false)}
              >
                {category.emoji} {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#2f7bff]"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-[#07111f] text-slate-300">
      <div className="grid w-full gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <CrownIcon />
            <span className="text-xl font-black tracking-wide text-white">
              MOD<span className="text-[#3b9eff]">PLAYS</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-slate-400">© 2026 ModPlays. All rights reserved.</p>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/games" className="hover:text-white">
                Games
              </Link>
            </li>
            <li>
              <Link href="/apps" className="hover:text-white">
                Apps
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-white">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/dmca" className="hover:text-white">
                DMCA
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Follow Us</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SocialIcon href="https://facebook.com" label="Facebook">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M14 9h3V6h-3c-1.7 0-3 1.6-3 3.5V12H8v3h3v7h3v-7h3l1-3h-4V9.6c0-.4.2-.6.7-.6z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://x.com" label="X">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M17.5 4h2.3l-5 5.7L21 20h-4.6l-3.6-6.1L8.6 20H6.3l5.4-6.2L5 4h4.7l3.2 5.5L17.5 4zm-.8 14.4h1.3L8.4 5.5H7L16.7 18.4z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://youtube.com" label="YouTube">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M22 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C18.2 5.4 12 5.4 12 5.4s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12.2 2 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM10 15.5v-6.6l5.2 3.3-5.2 3.3z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm8 1.6H8A2.4 2.4 0 0 0 5.6 8v8A2.4 2.4 0 0 0 8 18.4h8A2.4 2.4 0 0 0 18.4 16V8A2.4 2.4 0 0 0 16 5.6zm-4 2.5A3.9 3.9 0 1 1 8.1 12 3.9 3.9 0 0 1 12 8.1zm0 1.6A2.3 2.3 0 1 0 14.3 12 2.3 2.3 0 0 0 12 9.7zm4.4-2.5a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://reddit.com" label="Reddit">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M16.6 10.2a1.4 1.4 0 0 0-2 .2c-.8-.5-1.9-.9-3.1-1L12 7l2.3.5a1 1 0 1 0 .1-1.1L11.6 5.8 11 9.3c-1.3 0-2.5.4-3.4 1a1.4 1.4 0 1 0-1.6 2.2 3.6 3.6 0 0 0-.2 1.2c0 2.3 2.7 4.1 6 4.1s6-1.8 6-4.1a3.6 3.6 0 0 0-.2-1.2 1.4 1.4 0 0 0-1-2.3zM9.7 13.3a.9.9 0 1 1 .9.9.9.9 0 0 1-.9-.9zm5.5 2.2c-.6.7-1.8 1-2.8 1s-2.2-.3-2.8-1a.4.4 0 0 1 .6-.6c.4.4 1.3.7 2.2.7s1.8-.3 2.2-.7a.4.4 0 1 1 .6.6zm-.7-1.3a.9.9 0 1 1 .9-.9.9.9 0 0 1-.9.9z" />
              </svg>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}
