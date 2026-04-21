import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { CatalogProductRow } from "@/types/database.types";

export default function ProductCard({ product }: { product: CatalogProductRow }) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const desc = locale === "ar" && product.description_ar ? product.description_ar : product.description_fr;

  return (
    <div className="bg-vc-white border border-vc-mist hover:shadow-md hover:border-vc-teal/30 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-vc-mist overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-vc-silver/50 text-sm">
            No image
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs tracking-widest uppercase bg-black/60 px-3 py-1">
              {t("out_of_stock")}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-vc-silver text-xs tracking-widest uppercase">{product.brand}</p>
            <h3 className="font-heading text-vc-dark text-lg leading-tight">{product.name}</h3>
          </div>
          <Badge
            variant="secondary"
            className="text-xs shrink-0 capitalize bg-vc-teal-lt text-vc-teal border-0"
          >
            {product.category}
          </Badge>
        </div>

        {desc && <p className="text-vc-silver text-sm leading-relaxed line-clamp-2 flex-1">{desc}</p>}

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-vc-mist">
          <span className="font-heading text-vc-teal text-lg">
            {formatPrice(product.price, locale)}
          </span>
          <Link
            href={`/${locale}/catalog/${product.id}`}
            className="text-xs tracking-widest uppercase text-vc-navy hover:text-vc-teal transition-colors"
          >
            {t("details")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
