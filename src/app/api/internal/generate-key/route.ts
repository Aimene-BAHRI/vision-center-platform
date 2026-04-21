import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateApiKey, hashApiKey } from "@/lib/api-auth";

const schema = z.object({ name: z.string().min(1).max(100) });

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { raw, prefix } = generateApiKey();
  const hash = await hashApiKey(raw);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("api_keys")
    .insert({ name: parsed.data.name, key_hash: hash, key_prefix: prefix });

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  return NextResponse.json({ raw });
}
