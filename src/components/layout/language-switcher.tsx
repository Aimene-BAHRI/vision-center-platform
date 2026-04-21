"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    // Replace the current locale prefix
    const segments = pathname.split("/");
    segments[1] = next;
    startTransition(() => router.push(segments.join("/")));
  }

  return (
    <button
      onClick={() => switchLocale(locale === "fr" ? "ar" : "fr")}
      disabled={isPending}
      className={`text-xs tracking-widest uppercase opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40 ${className ?? ""}`}
      aria-label="Switch language"
    >
      {locale === "fr" ? "عربي" : "FR"}
    </button>
  );
}
