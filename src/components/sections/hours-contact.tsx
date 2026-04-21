import { useTranslations } from "next-intl";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { isOpenNow } from "@/lib/utils";

export default function HoursContact({
  phone,
  whatsapp,
  address,
  hoursWeekdays,
  hoursThu,
  hoursFri,
}: {
  phone: string;
  whatsapp: string;
  address: string;
  hoursWeekdays: string;
  hoursThu: string;
  hoursFri: string;
}) {
  const t = useTranslations("contact");
  const open = isOpenNow();

  return (
    <section id="contact" className="py-24 bg-vc-navy text-vc-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        {/* Hours */}
        <div>
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-4">{t("hours_title")}</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-vc-silver">{t("saturday_wednesday")}</span>
              <span>{hoursWeekdays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vc-silver">{t("thursday")}</span>
              <span>{hoursThu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vc-silver">{t("friday")}</span>
              <span className="text-red-400">{hoursFri}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            <span className="text-xs tracking-wide">
              {open ? t("open_now") : t("closed_now")}
            </span>
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-4">Contact</p>
          <div className="space-y-4 text-sm">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 hover:text-vc-teal transition-colors"
            >
              <Phone size={16} className="text-vc-teal shrink-0" />
              {phone}
            </a>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[#25d366] transition-colors"
            >
              <MessageCircle size={16} className="text-[#25d366] shrink-0" />
              WhatsApp
            </a>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-vc-teal shrink-0 mt-0.5" />
              <span className="text-vc-silver">{address}</span>
            </div>
          </div>
        </div>

        {/* Map embed */}
        <div>
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-4">{t("title")}</p>
          <div className="w-full h-48 bg-vc-slate overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=ChIJjea2VwBjfg0R9o0RP9CMeCM&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
