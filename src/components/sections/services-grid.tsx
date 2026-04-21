"use client";

import { useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import * as Icons from "lucide-react";
import type { ServiceRow as Service } from "@/types/database.types";

function ServiceCard({ service, locale }: { service: Service; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const name = locale === "ar" ? service.name_ar : service.name_fr;
  const desc = locale === "ar" ? service.description_ar : service.description_fr;

  // Dynamically pick lucide icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[service.icon] ?? Icons.Eye;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-vc-white border border-vc-mist p-8 flex flex-col gap-4 hover:shadow-lg hover:border-vc-teal/30 transition-all duration-300 cursor-default"
      style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.5s, transform 0.5s" }}
    >
      <div className="w-12 h-12 bg-vc-teal-lt flex items-center justify-center text-vc-teal">
        <Icon size={24} />
      </div>
      <h3 className="font-heading text-xl text-vc-dark">{name}</h3>
      <p className="text-vc-silver text-sm leading-relaxed flex-1">{desc}</p>
    </div>
  );
}

export default function ServicesGrid({ services }: { services: Service[] }) {
  const t = useTranslations("services");
  const locale = useLocale();

  return (
    <section id="services" className="py-24 bg-vc-mist">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-2">{t("subtitle")}</p>
          <h2 className="font-heading text-4xl md:text-5xl text-vc-dark">{t("title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
