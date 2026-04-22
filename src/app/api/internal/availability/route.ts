import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Returns booked time slots for a given date (confirmed appointments only)
export async function GET(request: NextRequest) {
  const date    = request.nextUrl.searchParams.get("date");
  const exclude = request.nextUrl.searchParams.get("exclude"); // appointment id to ignore
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const supabase = await createSupabaseServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("appointments")
    .select("preferred_time")
    .eq("preferred_date", date)
    .eq("status", "confirmed");

  if (exclude) query = query.neq("id", exclude);

  const { data } = await query;
  const booked: string[] = (data ?? []).map((r: { preferred_time: string }) => r.preferred_time);
  return NextResponse.json({ booked });
}
