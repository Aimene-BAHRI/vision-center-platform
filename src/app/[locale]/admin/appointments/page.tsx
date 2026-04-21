"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { AppointmentRow } from "@/types/database.types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

export default function AppointmentsPage() {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from("appointments").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as AppointmentRow[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: AppointmentRow["status"]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("appointments").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-vc-silver">Chargement…</div>;

  return (
    <div>
      <h1 className="font-heading text-3xl text-vc-dark mb-8">Rendez-vous</h1>
      <div className="bg-vc-white border border-vc-mist overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-vc-mist text-vc-slate text-xs tracking-widest uppercase">
            <tr>
              <th className="px-4 py-3 text-start">Patient</th>
              <th className="px-4 py-3 text-start">Téléphone</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Heure</th>
              <th className="px-4 py-3 text-start">Motif</th>
              <th className="px-4 py-3 text-start">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vc-mist">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-vc-mist/50">
                <td className="px-4 py-3 font-medium text-vc-dark">{r.full_name}</td>
                <td className="px-4 py-3 text-vc-slate">
                  <a href={`tel:${r.phone}`} className="hover:text-vc-teal">{r.phone}</a>
                </td>
                <td className="px-4 py-3 text-vc-slate">{r.preferred_date}</td>
                <td className="px-4 py-3 text-vc-slate capitalize">{r.preferred_time}</td>
                <td className="px-4 py-3 text-vc-silver max-w-xs truncate">{r.reason ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as AppointmentRow["status"])}
                    className={`text-xs px-2 py-1 border-0 rounded cursor-pointer font-medium ${STATUS_COLORS[r.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center py-12 text-vc-silver">Aucun rendez-vous pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
