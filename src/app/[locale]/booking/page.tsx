import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BookingForm from "@/components/booking/booking-form";

export async function generateMetadata() {
  const t = await getTranslations("booking");
  return { title: t("title") };
}

export default async function BookingPage() {
  const t = await getTranslations("booking");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20 bg-vc-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-2">{t("subtitle")}</p>
            <h1 className="font-heading text-4xl md:text-5xl text-vc-dark">{t("title")}</h1>
          </div>
          <BookingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
