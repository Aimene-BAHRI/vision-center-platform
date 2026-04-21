import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <footer className="bg-vc-dark text-vc-silver border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="font-heading text-vc-white text-xl mb-1">Vision Center</p>
          <p className="text-vc-teal text-xs tracking-widest uppercase mb-3">Khouane Yacine</p>
          <p className="text-sm leading-relaxed">{t("tagline")}</p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <p className="text-vc-white text-xs tracking-widest uppercase mb-1">Navigation</p>
          <a href="#services" className="text-sm hover:text-vc-teal transition-colors">{tNav("services")}</a>
          <a href="#catalog" className="text-sm hover:text-vc-teal transition-colors">{tNav("catalog")}</a>
          <a href="#gallery" className="text-sm hover:text-vc-teal transition-colors">{tNav("gallery")}</a>
          <Link href={`/${locale}/booking`} className="text-sm hover:text-vc-teal transition-colors">{tNav("bookExam")}</Link>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <p className="text-vc-white text-xs tracking-widest uppercase mb-1">Contact</p>
          <p className="text-sm">+213 674 08 81 58</p>
          <p className="text-sm">W32, Bir El Djir, Oran</p>
          <a
            href="https://wa.me/213674088158"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#25d366] hover:underline"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 text-center py-4 text-xs text-vc-silver/60">
        © {new Date().getFullYear()} Vision Center Khouane Yacine. {t("rights")}
      </div>
    </footer>
  );
}
