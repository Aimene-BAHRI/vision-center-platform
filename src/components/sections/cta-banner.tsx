import { getTranslations, getLocale } from "next-intl/server";

export default async function CtaBanner({ whatsapp }: { whatsapp: string }) {
  const t = await getTranslations("cta");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <section className="bg-vc-teal py-20 text-center text-vc-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-heading text-4xl md:text-5xl mb-3">{t("title")}</h2>
        <p className="text-white/80 mb-8 text-lg">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-vc-dark text-vc-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-vc-navy transition-colors"
          >
            {t("button")}
          </a>
          <a
            href={`/${locale}/booking`}
            className="border border-white text-vc-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-vc-teal transition-colors"
          >
            {tNav("bookExam")}
          </a>
        </div>
      </div>
    </section>
  );
}
