"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Star } from "lucide-react";
import type { TestimonialRow } from "@/types/database.types";
import { toast } from "sonner";

export default function TestimonialsAdminPage() {
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from("testimonials").select("*").order("display_order");
    setRows((data ?? []) as TestimonialRow[]);
  }

  useEffect(() => { load(); }, []);

  async function toggle(id: string, val: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("testimonials").update({ is_visible: val }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, is_visible: val } : r));
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("testimonials").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Supprimé");
  }

  async function create() {
    const payload = {
      author_name: "Nouveau client",
      rating: 5,
      body_fr: "Votre avis ici...",
      body_ar: null,
      source: "manual",
      is_visible: true,
      display_order: rows.length + 1,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from("testimonials").insert(payload);
    if (!error) { toast.success("Créé"); load(); } else toast.error("Erreur");
  }

  async function updateField(id: string, field: keyof TestimonialRow, value: string | number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("testimonials").update({ [field]: value }).eq("id", id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-vc-dark">Témoignages</h1>
        <Button onClick={create} className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs tracking-widest uppercase gap-2">
          <Plus size={14} /> Ajouter
        </Button>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="bg-vc-white border border-vc-mist p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Switch checked={r.is_visible} onCheckedChange={(v) => toggle(r.id, v)} />
              <span className="flex-1 font-medium text-vc-dark">{r.author_name}</span>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <button onClick={() => remove(r.id)} className="text-vc-silver hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1 block">Auteur</Label>
                <Input
                  value={r.author_name}
                  onChange={(e) => updateField(r.id, "author_name", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Note (1–5)</Label>
                <Input
                  type="number" min={1} max={5}
                  value={r.rating}
                  onChange={(e) => updateField(r.id, "rating", parseInt(e.target.value) || 5)}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Avis (FR)</Label>
                <Textarea rows={3} value={r.body_fr} onChange={(e) => updateField(r.id, "body_fr", e.target.value)} />
              </div>
              <div dir="rtl">
                <Label className="text-xs mb-1 block">الرأي (AR)</Label>
                <Textarea rows={3} value={r.body_ar ?? ""} onChange={(e) => updateField(r.id, "body_ar", e.target.value)} className="font-arabic" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
