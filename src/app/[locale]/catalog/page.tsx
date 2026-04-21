import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CatalogFilters from "@/components/catalog/catalog-filters";
import ProductCard from "@/components/catalog/product-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogProductRow } from "@/types/database.types";

export async function generateMetadata() {
  const t = await getTranslations("catalog");
  return { title: t("title") };
}

async function getProducts(searchParams: Record<string, string>) {
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from("catalog_products").select("*").eq("is_active", true);

  if (searchParams.category && searchParams.category !== "all") {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.brand) {
    query = query.eq("brand", searchParams.brand);
  }
  if (searchParams.in_stock === "true") {
    query = query.gt("stock", 0);
  }

  query = query.order("name");
  const { data } = await query;
  return (data ?? []) as CatalogProductRow[];
}

async function getBrands() {
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("catalog_products")
    .select("brand")
    .eq("is_active", true);
  const raw = (data ?? []) as { brand: string }[];
  return [...new Set(raw.map((r) => r.brand))].sort();
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const t = await getTranslations("catalog");
  const params = await searchParams;
  const [products, brands] = await Promise.all([getProducts(params), getBrands()]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20 bg-vc-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-vc-teal text-xs tracking-[0.25em] uppercase mb-2">{t("subtitle")}</p>
            <h1 className="font-heading text-4xl md:text-5xl text-vc-dark">{t("title")}</h1>
          </div>

          {/* Filters */}
          <Suspense fallback={null}>
            <CatalogFilters brands={brands} />
          </Suspense>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 text-vc-silver">{t("no_results")}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
