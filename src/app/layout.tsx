import { headers } from "next/headers";
import { Playfair_Display, Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap", weight: ["300", "400", "500", "700"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "fr";
  const isRtl = locale === "ar";
  const fontClass = isRtl
    ? `${notoArabic.variable} ${playfair.variable}`
    : `${inter.variable} ${playfair.variable}`;

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className={`${fontClass} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-vc-white text-vc-dark">
        {children}
      </body>
    </html>
  );
}
