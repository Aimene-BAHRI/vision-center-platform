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
  if (!(await validateApiKey(apiKey))) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: CORS });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any)
    .from("services")
    .select("id, name_fr, name_ar, description_fr, description_ar, icon, display_order")
    .eq("is_active", true)
    .order("display_order");

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500, headers: CORS });

  return NextResponse.json({ data }, { headers: CORS });
}
