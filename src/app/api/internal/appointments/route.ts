import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.enum(["morning", "afternoon", "evening"]),
  reason: z.string().max(500).optional(),
  locale: z.enum(["fr", "ar"]).default("fr"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, ...rest } = parsed.data;
    const supabase = await createSupabaseServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("appointments")
      .insert({ ...rest, email: email || null })
      .select("id")
      .single();

    if (error) {
      console.error("appointment insert error", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const row = data as { id: string } | null;
    return NextResponse.json({ success: true, id: row?.id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
