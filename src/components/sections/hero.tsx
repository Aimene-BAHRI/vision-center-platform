"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const WORDS_FR = ["parfaite clarté", "pleine netteté", "chaque style", "vraie précision"];
const WORDS_AR = ["وضوح تام", "دقة عالية", "كل أسلوب", "إتقان حقيقي"];

export default function Hero({ heroTitle, heroSubtitle }: { heroTitle: string; heroSubtitle: string }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const words = locale === "ar" ? WORDS_AR : WORDS_FR;
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setFade(true);
      }, 300);
    }, 2400);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-vc-dark">
      {/* Background image */}
      <div
        className="absolute inset-0 scale-105 bg-center bg-cover transition-transform duration-[8000ms]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1600&q=80&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-vc-dark/75" />

      {/* Floating badge */}
      <div className="absolute top-1/3 end-8 md:end-16 bg-vc-teal/90 backdrop-blur text-vc-white text-center px-5 py-4 rounded-full hidden md:flex flex-col items-center">
        <span className="font-heading text-3xl font-light">10+</span>
        <span className="text-xs tracking-wider mt-0.5">{t("badge")}</span>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-0">
        <p className="text-vc-teal text-xs tracking-[0.3em] uppercase mb-4">{t("location")}</p>

        <h1 className="font-heading text-5xl md:text-7xl text-vc-white leading-tight mb-2">
          {heroTitle}
        </h1>

        <p className="text-vc-white/60 text-lg md:text-xl mb-2">{heroSubtitle}</p>

        <p className="text-vc-teal text-2xl md:text-3xl font-heading italic mb-10 h-9">
          <span
            className="inline-block transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          >
            {words[idx]}
          </span>
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#services"
            className="bg-vc-teal text-vc-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#0e9fcc] transition-colors"
          >
            {t("cta_services")}
          </a>
          <Link
            href={`/${locale}/booking`}
            className="border border-vc-white/40 text-vc-white px-8 py-3 text-sm tracking-widest uppercase hover:border-vc-white transition-colors"
          >
            {t("cta_contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
