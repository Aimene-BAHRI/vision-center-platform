import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Locale } from "@/i18n/config";
import { Toaster } from "@/components/ui/sonner";

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

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <Toaster position={isRtl ? "bottom-left" : "bottom-right"} />
    </NextIntlClientProvider>
  );
}
