import { useTranslations } from "next-intl";
import Image from "next/image";

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&q=80&auto=format&fit=crop", alt: "Optical frames display" },
  { src: "https://images.unsplash.com/photo-1516825295064-0e5d7e7a1db4?w=600&q=80&auto=format&fit=crop", alt: "Eye examination" },
  { src: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80&auto=format&fit=crop", alt: "Glasses collection" },
  { src: "https://images.unsplash.com/photo-1599230407020-b7e1ef95d1ef?w=600&q=80&auto=format&fit=crop", alt: "Sunglasses" },
  { src: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=600&q=80&auto=format&fit=crop", alt: "Contact lenses" },
  { src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80&auto=format&fit=crop", alt: "Optical center" },
];

export default function Gallery() {
  const t = useTranslations("gallery");

  return (
    <section id="gallery" className="py-24 bg-vc-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-2">{t("subtitle")}</p>
          <h2 className="font-heading text-4xl md:text-5xl text-vc-white">{t("title")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY_IMAGES.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden group">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-vc-navy/0 group-hover:bg-vc-navy/30 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
