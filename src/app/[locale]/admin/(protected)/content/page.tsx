"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SiteContentRow } from "@/types/database.types";
import { toast } from "sonner";

export default function ContentPage() {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from("site_content").select("*").order("label");
    setRows((data ?? []) as SiteContentRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(id: string, field: "value_fr" | "value_ar" | "value_numeric", value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === "value_numeric" ? (parseFloat(value) || null) : value }
          : r
      )
    );
  }

  async function save() {
    setSaving(true);
    const updates = rows.map((r) => ({
      id: r.id,
      content_key: r.content_key,
      content_type: r.content_type,
      label: r.label,
      value_fr: r.value_fr,
      value_ar: r.value_ar,
      value_numeric: r.value_numeric,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from("site_content").upsert(updates);
    setSaving(false);
    if (error) toast.error("Erreur lors de l'enregistrement");
    else toast.success("Contenu publié avec succès !");
  }

  if (loading) return <div className="text-vc-silver">Chargement…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-vc-dark">Contenu du site</h1>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-vc-teal hover:bg-[#0e9fcc] text-white tracking-widest uppercase text-xs"
        >
          {saving ? "Enregistrement…" : "Publier les modifications"}
        </Button>
      </div>

      <div className="space-y-6">
        {rows.map((r) => (
          <div key={r.id} className="bg-vc-white border border-vc-mist p-6 space-y-4">
            <p className="text-xs text-vc-silver tracking-widest uppercase font-medium">{r.label}</p>
            {r.content_type === "number" ? (
              <div>
                <Label className="text-vc-slate text-xs mb-1 block">Valeur</Label>
                <Input
                  type="number"
                  value={r.value_numeric ?? ""}
                  onChange={(e) => update(r.id, "value_numeric", e.target.value)}
                  className="max-w-xs"
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-vc-slate text-xs mb-1 block">Français</Label>
                  {r.content_type === "richtext" ? (
                    <Textarea
                      value={r.value_fr ?? ""}
                      onChange={(e) => update(r.id, "value_fr", e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <Input value={r.value_fr ?? ""} onChange={(e) => update(r.id, "value_fr", e.target.value)} />
                  )}
                </div>
                <div dir="rtl">
                  <Label className="text-vc-slate text-xs mb-1 block">العربية</Label>
                  {r.content_type === "richtext" ? (
                    <Textarea
                      value={r.value_ar ?? ""}
                      onChange={(e) => update(r.id, "value_ar", e.target.value)}
                      rows={4}
                      className="font-arabic"
                    />
                  ) : (
                    <Input
                      value={r.value_ar ?? ""}
                      onChange={(e) => update(r.id, "value_ar", e.target.value)}
                      className="font-arabic"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
