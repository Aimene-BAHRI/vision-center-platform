import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateApiKey } from "@/lib/api-auth";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const valid = await validateApiKey(apiKey);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: CORS });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const inStock = searchParams.get("in_stock");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = sb
    .from("catalog_products")
    .select("id, name, category, brand, price, stock, image_url, description_fr, description_ar", { count: "exact" })
    .eq("is_active", true);

  if (category && ["frames", "lenses", "sunglasses"].includes(category)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).eq("category", category);
  }
  if (brand) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).eq("brand", brand);
  }
  if (inStock === "true") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).gt("stock", 0);
  }
  if (minPrice) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).gte("price", parseFloat(minPrice));
  }
  if (maxPrice) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).lte("price", parseFloat(maxPrice));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (query as any)
    .order("name")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ error: "Query failed" }, { status: 500, headers: CORS });
  }

  return NextResponse.json(
    { data, total: count ?? 0, page, limit },
    { headers: CORS }
  );
}
