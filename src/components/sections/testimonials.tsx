import { useTranslations, useLocale } from "next-intl";
import { Star } from "lucide-react";
import type { TestimonialRow as Testimonial } from "@/types/database.types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("testimonials");
  const locale = useLocale();

  return (
    <section className="py-24 bg-vc-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-2">{t("subtitle")}</p>
          <h2 className="font-heading text-4xl md:text-5xl text-vc-dark">{t("title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const body = locale === "ar" && t.body_ar ? t.body_ar : t.body_fr;
            return (
              <div key={t.id} className="bg-vc-mist p-8 flex flex-col gap-4">
                <Stars rating={t.rating} />
                <p className="font-heading italic text-vc-slate text-lg leading-relaxed flex-1">
                  &ldquo;{body}&rdquo;
                </p>
                <p className="text-vc-teal text-xs tracking-widest uppercase">
                  — {t.author_name}
                  {t.source === "google" && (
                    <span className="ms-2 text-vc-silver">· Google</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
