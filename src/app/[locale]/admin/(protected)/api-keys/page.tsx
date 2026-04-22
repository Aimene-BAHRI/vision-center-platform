"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Copy, Eye, EyeOff } from "lucide-react";
import type { ApiKeyRow } from "@/types/database.types";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from("api_keys").select("id, name, key_prefix, is_active, last_used_at, created_at").order("created_at", { ascending: false });
    setRows((data ?? []) as ApiKeyRow[]);
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    if (!keyName.trim()) { toast.error("Entrez un nom pour cette clé"); return; }
    const res = await fetch("/api/internal/generate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: keyName }),
    });
    if (!res.ok) { toast.error("Erreur"); return; }
    const { raw } = await res.json();
    setNewKey(raw);
    setKeyName("");
    toast.success("Clé créée — copiez-la maintenant, elle ne sera plus affichée !");
    load();
  }

  async function toggle(id: string, val: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("api_keys").update({ is_active: val }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, is_active: val } : r));
  }

  async function remove(id: string) {
    if (!confirm("Révoquer cette clé API ?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("api_keys").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Clé révoquée");
  }

  return (
    <div>
      <h1 className="font-heading text-3xl text-vc-dark mb-2">Clés API</h1>
      <p className="text-vc-silver text-sm mb-8">Ces clés permettent à votre ecommerce d&apos;accéder au catalogue via <code className="bg-vc-mist px-1">/api/v1/catalog</code></p>

      {/* Generate */}
      <div className="bg-vc-white border border-vc-mist p-6 mb-6 space-y-4">
        <p className="font-medium text-vc-dark text-sm">Créer une nouvelle clé</p>
        <div className="flex gap-3">
          <Input
            placeholder="ex: Ecommerce Production"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={generate} className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs tracking-widest uppercase gap-2">
            <Plus size={14} /> Générer
          </Button>
        </div>

        {newKey && (
          <div className="bg-green-50 border border-green-200 p-4 space-y-2">
            <p className="text-green-700 text-xs font-medium">Copiez cette clé maintenant — elle ne sera plus affichée.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white border border-green-200 px-3 py-2 rounded font-mono">
                {showNew ? newKey : newKey.replace(/./g, "•")}
              </code>
              <button onClick={() => setShowNew(!showNew)} className="text-green-600 hover:text-green-800">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copié !"); }}
                className="text-green-600 hover:text-green-800"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-vc-white border border-vc-mist overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-vc-mist text-vc-slate text-xs tracking-widest uppercase">
            <tr>
              <th className="px-4 py-3 text-start">Nom</th>
              <th className="px-4 py-3 text-start">Préfixe</th>
              <th className="px-4 py-3 text-start">Dernière utilisation</th>
              <th className="px-4 py-3 text-start">Active</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vc-mist">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-vc-mist/40">
                <td className="px-4 py-3 font-medium text-vc-dark">{r.name}</td>
                <td className="px-4 py-3"><code className="text-xs bg-vc-mist px-2 py-0.5">{r.key_prefix}…</code></td>
                <td className="px-4 py-3 text-vc-silver text-xs">
                  {r.last_used_at ? new Date(r.last_used_at).toLocaleString("fr-DZ") : "Jamais"}
                </td>
                <td className="px-4 py-3">
                  <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(r.id)} className="text-vc-silver hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center py-12 text-vc-silver">Aucune clé API. Créez-en une.</p>
        )}
      </div>
    </div>
  );
}
