import { createClient } from "@supabase/supabase-js";

function sha256(message: string): Promise<string> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(message))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
}

function getServiceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as ReturnType<typeof createClient>;
}

export async function validateApiKey(key: string | null): Promise<boolean> {
  if (!key) return false;
  const hash = await sha256(key);
  const supabase = getServiceClient();

  const { data } = await supabase
    .from("api_keys")
    .select("id, is_active")
    .eq("key_hash", hash)
    .maybeSingle();

  const row = data as { id: string; is_active: boolean } | null;
  if (!row || !row.is_active) return false;

  // fire-and-forget: touch last_used_at via REST (avoids untyped generic issue)
  fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/api_keys?id=eq.${row.id}`,
    {
      method: "PATCH",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ last_used_at: new Date().toISOString() }),
    }
  ).catch(() => {});

  return true;
}

export function generateApiKey(): { raw: string; prefix: string } {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw =
    "vc_live_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  return { raw, prefix: raw.slice(0, 16) };
}

export async function hashApiKey(raw: string): Promise<string> {
  return sha256(raw);
}
