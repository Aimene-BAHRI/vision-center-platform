"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Settings, Package, Calendar, Star, FileText, Key, Eye, LogOut
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}/admin`;

  const links = [
    { href: base, label: t("dashboard"), icon: <LayoutDashboard size={16} /> },
    { href: `${base}/services`, label: t("services"), icon: <Settings size={16} /> },
    { href: `${base}/catalog`, label: t("catalog"), icon: <Package size={16} /> },
    { href: `${base}/appointments`, label: t("appointments"), icon: <Calendar size={16} /> },
    { href: `${base}/testimonials`, label: t("testimonials"), icon: <Star size={16} /> },
    { href: `${base}/content`, label: t("content"), icon: <FileText size={16} /> },
    { href: `${base}/api-keys`, label: t("api_keys"), icon: <Key size={16} /> },
  ];

  async function logout() {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push(`/${locale}/admin/login`);
  }

  return (
    <aside className="w-64 bg-vc-dark text-vc-white flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-vc-teal">
          <Eye size={20} />
          <span className="font-heading text-lg">Vision Center</span>
        </div>
        <p className="text-vc-silver text-xs mt-1">Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== base && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                active
                  ? "bg-vc-teal text-white"
                  : "text-vc-silver hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.icon}
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-vc-silver hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
