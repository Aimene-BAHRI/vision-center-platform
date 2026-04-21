"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#services", label: t("services") },
    { href: "#catalog", label: t("catalog") },
    { href: "#gallery", label: t("gallery") },
    { href: "#about", label: t("about") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${
        scrolled
          ? "bg-vc-dark/95 backdrop-blur-md py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      {/* Logo */}
      <Link href={`/${locale}`} className="flex flex-col leading-none">
        <span className="font-heading text-vc-white text-lg tracking-wide">
          Vision Center
        </span>
        <span className="text-vc-teal text-[0.6rem] tracking-[0.25em] uppercase">
          Khouane Yacine
        </span>
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-8 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-vc-white/80 hover:text-vc-white text-[0.7rem] tracking-widest uppercase transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher className="text-vc-white hidden md:block" />
        <Link
          href={`/${locale}/booking`}
          className="hidden md:inline-flex bg-vc-teal text-vc-white text-[0.65rem] tracking-widest uppercase px-5 py-2.5 hover:bg-[#0e9fcc] transition-colors"
        >
          {t("bookExam")}
        </Link>
        {/* Mobile toggle */}
        <button
          className="md:hidden text-vc-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute top-full inset-x-0 bg-vc-dark/98 backdrop-blur-md flex flex-col gap-6 px-8 py-8 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-vc-white/80 hover:text-vc-white text-sm tracking-widest uppercase"
            >
              {l.label}
            </a>
          ))}
          <LanguageSwitcher className="text-vc-white" />
          <Link
            href={`/${locale}/booking`}
            onClick={() => setOpen(false)}
            className="bg-vc-teal text-vc-white text-center text-sm tracking-widest uppercase px-5 py-3"
          >
            {t("bookExam")}
          </Link>
        </div>
      )}
    </nav>
  );
}
