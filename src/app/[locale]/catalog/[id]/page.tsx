import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CatalogProductRow } from "@/types/database.types";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("catalog_products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!data) notFound();

  const product = data as CatalogProductRow;
  const locale = await getLocale();
  const t = await getTranslations("catalog");
  const desc = locale === "ar" && product.description_ar ? product.description_ar : product.description_fr;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20 bg-vc-white">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href={`/${locale}/catalog`}
            className="text-vc-teal text-xs tracking-widest uppercase hover:underline mb-8 inline-block"
          >
            ← {t("title")}
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative aspect-square bg-vc-mist overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-vc-silver/40">
                  No image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6 justify-center">
              <div>
                <p className="text-vc-silver text-xs tracking-widest uppercase mb-1">{product.brand}</p>
                <h1 className="font-heading text-4xl text-vc-dark mb-3">{product.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-vc-teal-lt text-vc-teal border-0 capitalize">{product.category}</Badge>
                  {product.stock > 0 ? (
                    <Badge className="bg-green-100 text-green-700 border-0">{t("in_stock")}</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-600 border-0">{t("out_of_stock")}</Badge>
                  )}
                </div>
              </div>

              <p className="font-heading text-4xl text-vc-teal">
                {formatPrice(product.price, locale)}
              </p>

              {desc && <p className="text-vc-slate/80 leading-relaxed">{desc}</p>}

              <a
                href="https://wa.me/213674088158"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-vc-teal text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#0e9fcc] transition-colors w-fit"
              >
                Commander via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
