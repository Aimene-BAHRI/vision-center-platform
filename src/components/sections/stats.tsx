"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { value: count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-5xl md:text-6xl text-vc-white">
        {count.toLocaleString()}<span className="text-vc-teal">+</span>
      </p>
      <p className="text-vc-silver text-sm mt-2 tracking-wide">{suffix}</p>
      <p className="text-vc-teal/70 text-xs mt-1 tracking-widest uppercase">{label}</p>
    </div>
  );
}

type Props = {
  years: number;
  patients: number;
  frames: number;
  services: number;
};

export default function Stats({ years, patients, frames, services }: Props) {
  const t = useTranslations("stats");

  return (
    <section className="bg-vc-slate py-20">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        <Stat value={years} suffix={t("years")} label="Experience" />
        <Stat value={patients} suffix={t("patients")} label="Satisfied" />
        <Stat value={frames} suffix={t("frames")} label="In Stock" />
        <Stat value={services} suffix={t("services")} label="Offered" />
      </div>
    </section>
  );
}
