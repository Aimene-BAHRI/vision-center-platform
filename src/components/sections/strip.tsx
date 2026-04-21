import { useTranslations } from "next-intl";
import { Eye, Clock, MapPin, Calendar } from "lucide-react";

export default function Strip({ hoursValue }: { hoursValue: string }) {
  const t = useTranslations("strip");

  const items = [
    { icon: <Eye size={20} />, label: t("specialty_label"), value: t("specialty_value") },
    { icon: <Clock size={20} />, label: t("hours_label"), value: hoursValue },
    { icon: <MapPin size={20} />, label: t("location_label"), value: "Bir El Djir, Oran" },
    { icon: <Calendar size={20} />, label: t("appointment_label"), value: t("appointment_value") },
  ];

  return (
    <section className="bg-vc-navy border-y border-white/10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center px-6 py-8 border-e border-white/10 last:border-e-0"
          >
            <div className="text-vc-teal mb-3">{item.icon}</div>
            <p className="text-vc-silver text-[0.65rem] tracking-widest uppercase mb-1">{item.label}</p>
            <p className="text-vc-white text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
