import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Locale } from "@/i18n/config";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Vision Center Khouane Yacine | Centre Optique Bir El Djir",
    template: "%s | Vision Center Khouane",
  },
  description:
    "Centre optique à Bir El Djir, Oran. Examens de vue, montures, lentilles et lunettes de soleil. Optique Khouane Yacine.",
  keywords: ["optique", "lunettes", "oran", "bir el djir", "khouane"],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  const isRtl = locale === "ar";
  const fontClass = isRtl
    ? `${notoArabic.variable} ${playfair.variable}`
    : `${inter.variable} ${playfair.variable}`;

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${fontClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-vc-white text-vc-dark">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position={isRtl ? "bottom-left" : "bottom-right"} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
