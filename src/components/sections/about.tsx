import { useTranslations } from "next-intl";
import Image from "next/image";

export default function About({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-24 bg-vc-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="relative h-[420px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&q=80&auto=format&fit=crop"
            alt="Vision Center interior"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-vc-navy/20" />
        </div>

        {/* Text */}
        <div>
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-3">À propos</p>
          <h2 className="font-heading text-4xl md:text-5xl text-vc-dark leading-tight mb-6">
            {title}
          </h2>
          <p className="text-vc-slate/80 leading-relaxed mb-8 whitespace-pre-line">{body}</p>
          <p className="font-heading italic text-vc-navy text-lg">{t("signature")}</p>
        </div>
      </div>
    </section>
  );
}
