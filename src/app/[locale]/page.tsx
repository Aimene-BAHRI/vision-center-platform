import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ServiceRow, TestimonialRow, SiteContentRow } from "@/types/database.types";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Hero from "@/components/sections/hero";
import Strip from "@/components/sections/strip";
import Stats from "@/components/sections/stats";
import About from "@/components/sections/about";
import ServicesGrid from "@/components/sections/services-grid";
import Gallery from "@/components/sections/gallery";
import Testimonials from "@/components/sections/testimonials";
import HoursContact from "@/components/sections/hours-contact";
import CtaBanner from "@/components/sections/cta-banner";
import { getLocale } from "next-intl/server";

export const revalidate = 3600;

async function getSiteContent() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_content").select("*");
  const rows = (data ?? []) as SiteContentRow[];
  const map: Record<string, SiteContentRow> = {};
  for (const row of rows) map[row.content_key] = row;
  return map;
}

async function getServices() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return (data ?? []) as ServiceRow[];
}

async function getTestimonials() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_visible", true)
    .order("display_order");
  return (data ?? []) as TestimonialRow[];
}

export default async function HomePage() {
  const locale = await getLocale();
  const [content, services, testimonials] = await Promise.all([
    getSiteContent(),
    getServices(),
    getTestimonials(),
  ]);

  function get(key: string, field: "fr" | "ar" | "num"): string | number {
    const row = content[key];
    if (!row) return field === "num" ? 0 : "";
    if (field === "num") return row.value_numeric ?? 0;
    return (field === "ar" ? row.value_ar : row.value_fr) ?? "";
  }

  const loc = locale === "ar" ? "ar" : "fr";
  const heroTitle = get("hero_title", loc) as string;
  const heroSubtitle = get("hero_subtitle", loc) as string;
  const aboutTitle = get("about_title", loc) as string;
  const aboutBody = get("about_body", loc) as string;
  const hoursWeekdays = get("hours_sat_wed", loc) as string;
  const hoursThu = get("hours_thu", loc) as string;
  const hoursFri = get("hours_fri", loc) as string;
  const phone = get("contact_phone", "fr") as string;
  const whatsapp = get("contact_whatsapp", "fr") as string;
  const address = get("contact_address", loc) as string;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero heroTitle={heroTitle} heroSubtitle={heroSubtitle} />
        <Strip hoursValue={hoursWeekdays} />
        <Stats
          years={get("stat_years", "num") as number}
          patients={get("stat_patients", "num") as number}
          frames={get("stat_frames", "num") as number}
          services={get("stat_services", "num") as number}
        />
        <About title={aboutTitle} body={aboutBody} />
        <ServicesGrid services={services} />
        <Gallery />
        <Testimonials testimonials={testimonials} />
        <HoursContact
          phone={phone}
          whatsapp={whatsapp}
          address={address}
          hoursWeekdays={hoursWeekdays}
          hoursThu={hoursThu}
          hoursFri={hoursFri}
        />
        <CtaBanner whatsapp={whatsapp} />
      </main>
      <Footer />

      {/* WhatsApp float */}
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 end-6 z-50 bg-[#25d366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
