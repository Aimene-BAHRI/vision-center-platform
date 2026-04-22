"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { ServiceRow } from "@/types/database.types";
import { toast } from "sonner";

const EMPTY: Partial<ServiceRow> = { name_fr: "", name_ar: "", description_fr: "", description_ar: "", icon: "Eye", is_active: true, display_order: 0 };

export default function ServicesAdminPage() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Partial<ServiceRow>>({ ...EMPTY });
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from("services").select("*").order("display_order");
    setRows((data ?? []) as ServiceRow[]);
  }

  useEffect(() => { load(); }, []);

  async function toggle(id: string, val: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("services").update({ is_active: val }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, is_active: val } : r));
  }

  async function save(id: string, updates: Partial<ServiceRow>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from("services").update(updates).eq("id", id);
    if (error) toast.error("Erreur"); else { toast.success("Enregistré"); await load(); }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce service ?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("services").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Service supprimé");
  }

  async function create() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from("services").insert(newRow);
    if (error) toast.error("Erreur"); else { toast.success("Service créé"); setAdding(false); setNewRow({ ...EMPTY }); await load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-vc-dark">Services</h1>
        <Button onClick={() => setAdding(true)} className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs tracking-widest uppercase gap-2">
          <Plus size={14} /> Ajouter
        </Button>
      </div>

      {adding && (
        <div className="bg-vc-white border border-vc-teal/40 p-6 mb-6 space-y-4">
          <p className="font-medium text-vc-dark text-sm">Nouveau service</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label className="text-xs mb-1 block">Nom (FR)</Label><Input value={newRow.name_fr} onChange={(e) => setNewRow({ ...newRow, name_fr: e.target.value })} /></div>
            <div dir="rtl"><Label className="text-xs mb-1 block">الاسم (AR)</Label><Input value={newRow.name_ar} onChange={(e) => setNewRow({ ...newRow, name_ar: e.target.value })} className="font-arabic" /></div>
            <div><Label className="text-xs mb-1 block">Description (FR)</Label><Input value={newRow.description_fr} onChange={(e) => setNewRow({ ...newRow, description_fr: e.target.value })} /></div>
            <div dir="rtl"><Label className="text-xs mb-1 block">الوصف (AR)</Label><Input value={newRow.description_ar} onChange={(e) => setNewRow({ ...newRow, description_ar: e.target.value })} className="font-arabic" /></div>
            <div><Label className="text-xs mb-1 block">Icône (Lucide)</Label><Input value={newRow.icon} onChange={(e) => setNewRow({ ...newRow, icon: e.target.value })} placeholder="Eye" /></div>
            <div><Label className="text-xs mb-1 block">Ordre</Label><Input type="number" value={newRow.display_order} onChange={(e) => setNewRow({ ...newRow, display_order: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={create} className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs">Créer</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="text-xs">Annuler</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="bg-vc-white border border-vc-mist">
            <div className="flex items-center gap-4 px-5 py-4">
              <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
              <span className="flex-1 font-medium text-vc-dark">{r.name_fr}</span>
              <span className="text-vc-silver text-sm">{r.name_ar}</span>
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="text-vc-silver hover:text-vc-teal">
                {expanded === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button onClick={() => remove(r.id)} className="text-vc-silver hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            {expanded === r.id && (
              <div className="px-5 pb-5 border-t border-vc-mist">
                <Separator className="mb-4" />
                <ServiceEditForm service={r} onSave={(u) => save(r.id, u)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceEditForm({ service, onSave }: { service: ServiceRow; onSave: (u: Partial<ServiceRow>) => void }) {
  const [vals, setVals] = useState({ ...service });
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div><Label className="text-xs mb-1 block">Nom (FR)</Label><Input value={vals.name_fr} onChange={(e) => setVals({ ...vals, name_fr: e.target.value })} /></div>
        <div dir="rtl"><Label className="text-xs mb-1 block">الاسم (AR)</Label><Input value={vals.name_ar} onChange={(e) => setVals({ ...vals, name_ar: e.target.value })} className="font-arabic" /></div>
        <div><Label className="text-xs mb-1 block">Description (FR)</Label><Input value={vals.description_fr} onChange={(e) => setVals({ ...vals, description_fr: e.target.value })} /></div>
        <div dir="rtl"><Label className="text-xs mb-1 block">الوصف (AR)</Label><Input value={vals.description_ar} onChange={(e) => setVals({ ...vals, description_ar: e.target.value })} className="font-arabic" /></div>
        <div><Label className="text-xs mb-1 block">Icône</Label><Input value={vals.icon} onChange={(e) => setVals({ ...vals, icon: e.target.value })} /></div>
        <div><Label className="text-xs mb-1 block">Ordre</Label><Input type="number" value={vals.display_order} onChange={(e) => setVals({ ...vals, display_order: parseInt(e.target.value) || 0 })} /></div>
      </div>
      <Button onClick={() => onSave(vals)} className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs tracking-widest uppercase">Enregistrer</Button>
    </div>
  );
}
