"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function CatalogFilters({ brands }: { brands: string[] }) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const category = searchParams.get("category") ?? "all";
  const brand = searchParams.get("brand") ?? "";
  const inStock = searchParams.get("in_stock") === "true";

  const categories = [
    { value: "all", label: t("filter_all") },
    { value: "frames", label: t("filter_frames") },
    { value: "lenses", label: t("filter_lenses") },
    { value: "sunglasses", label: t("filter_sunglasses") },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center mb-10">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setParam("category", c.value === "all" ? null : c.value)}
            className={`px-5 py-2 text-xs tracking-widest uppercase transition-colors ${
              category === c.value
                ? "bg-vc-teal text-white"
                : "bg-vc-mist text-vc-slate hover:bg-vc-teal/20"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Brand filter */}
      {brands.length > 0 && (
        <select
          value={brand}
          onChange={(e) => setParam("brand", e.target.value || null)}
          className="text-xs border border-vc-mist bg-vc-white px-3 py-2 text-vc-slate focus:outline-none focus:border-vc-teal"
        >
          <option value="">{t("filter_brand")}</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      )}

      {/* In stock toggle */}
      <label className="flex items-center gap-2 text-xs text-vc-slate cursor-pointer select-none">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setParam("in_stock", e.target.checked ? "true" : null)}
          className="accent-vc-teal w-4 h-4"
        />
        {t("filter_stock")}
      </label>
    </div>
  );
}
