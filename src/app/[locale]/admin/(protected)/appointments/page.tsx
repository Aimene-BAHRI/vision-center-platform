"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppointmentRow } from "@/types/database.types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Phone, Clock, FileText, Pencil, X, Check } from "lucide-react";
import { getSlotsForDate } from "@/lib/slots";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_DOT: Record<string, string> = {
  pending:   "bg-amber-400",
  confirmed: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const today = new Date().toISOString().split("T")[0];

// ── Reschedule inline form ──────────────────────────────────
function RescheduleForm({
  appointment,
  onSave,
  onCancel,
}: {
  appointment: AppointmentRow;
  onSave: (date: string, time: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate]           = useState(appointment.preferred_date);
  const [time, setTime]           = useState(appointment.preferred_time);
  const [bookedSlots, setBooked]  = useState<string[]>([]);
  const [saving, setSaving]       = useState(false);

  async function fetchBooked(d: string) {
    if (!d) return;
    const res = await fetch(`/api/internal/availability?date=${d}&exclude=${appointment.id}`);
    if (res.ok) {
      const { booked } = await res.json();
      setBooked(booked ?? []);
    }
  }

  useEffect(() => { fetchBooked(date); }, [date]);

  const slots = date ? getSlotsForDate(date) : [];
  const isFriday = date ? new Date(date + "T00:00:00").getDay() === 5 : false;

  async function handleSave() {
    if (!date || !time) return;
    setSaving(true);
    await onSave(date, time);
    setSaving(false);
  }

  return (
    <div className="mt-3 pt-3 border-t border-current/20 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Reporter le rendez-vous</p>

      {/* Date */}
      <div>
        <p className="text-xs opacity-70 mb-1">Nouvelle date</p>
        <Input
          type="date"
          min={today}
          value={date}
          onChange={(e) => { setDate(e.target.value); setTime(""); }}
          className="bg-white/60 border-current/20 text-current text-sm max-w-[180px]"
        />
        {isFriday && <p className="text-xs mt-1 opacity-80">Fermé le vendredi</p>}
      </div>

      {/* Slot grid */}
      {date && !isFriday && (
        <div>
          <p className="text-xs opacity-70 mb-1">Créneau</p>
          <div className="grid grid-cols-5 gap-1.5">
            {slots.map((slot) => {
              const booked = bookedSlots.includes(slot);
              const active = time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={booked}
                  onClick={() => setTime(slot)}
                  className={`py-1.5 text-xs border transition-all ${
                    booked
                      ? "opacity-30 line-through cursor-not-allowed border-current/10"
                      : active
                      ? "bg-vc-teal border-vc-teal text-white"
                      : "bg-white/40 border-current/20 hover:border-vc-teal"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!date || !time || isFriday || saving}
          onClick={handleSave}
          className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs gap-1"
        >
          <Check size={12} /> Enregistrer
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="text-xs gap-1 opacity-70">
          <X size={12} /> Annuler
        </Button>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function AppointmentsPage() {
  const [rows, setRows]         = useState<AppointmentRow[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from("appointments")
      .select("*")
      .order("preferred_date", { ascending: true })
      .order("preferred_time", { ascending: true });
    setRows((data ?? []) as AppointmentRow[]);
  }

  async function updateStatus(id: string, status: AppointmentRow["status"]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("appointments").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function reschedule(id: string, preferred_date: string, preferred_time: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any)
      .from("appointments")
      .update({ preferred_date, preferred_time, status: "confirmed" })
      .eq("id", id);
    if (error) { toast.error("Erreur lors du report"); return; }
    toast.success("Rendez-vous reporté et confirmé");
    setRescheduling(null);
    setSelected(new Date(preferred_date + "T00:00:00"));
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, preferred_date, preferred_time, status: "confirmed" } : r)
    );
  }

  useEffect(() => { load(); }, []);

  const selectedStr = format(selected, "yyyy-MM-dd");
  const dayRows = rows.filter((r) => r.preferred_date === selectedStr);
  const totalPending = rows.filter((r) => r.status === "pending").length;

  function isDayWithAppt(day: Date) {
    const str = format(day, "yyyy-MM-dd");
    return rows.some((r) => r.preferred_date === str);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-vc-dark">Rendez-vous</h1>
        {totalPending > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 border border-amber-200">
            {totalPending} en attente
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Calendar */}
        <div className="bg-vc-white border border-vc-mist p-4">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => { if (d) { setSelected(d); setRescheduling(null); } }}
            locale={fr}
            modifiers={{ hasAppt: isDayWithAppt }}
            modifiersClassNames={{
              hasAppt: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-vc-teal relative",
            }}
            className="w-full"
          />
          <div className="mt-4 pt-4 border-t border-vc-mist space-y-2">
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-xs text-vc-slate">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[k]}`} />
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Day panel */}
        <div className="bg-vc-white border border-vc-mist p-6">
          <h2 className="font-heading text-xl text-vc-dark mb-4 capitalize">
            {format(selected, "EEEE d MMMM yyyy", { locale: fr })}
          </h2>

          {dayRows.length === 0 ? (
            <p className="text-vc-silver text-sm py-8 text-center">Aucun rendez-vous ce jour.</p>
          ) : (
            <div className="space-y-3">
              {dayRows.map((r) => (
                <div key={r.id} className={`border p-4 ${STATUS_COLORS[r.status]}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="font-medium text-sm">{r.full_name}</p>
                      <div className="flex flex-wrap gap-3 text-xs opacity-80">
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          <a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {r.preferred_time}
                        </span>
                        {r.reason && (
                          <span className="flex items-center gap-1 truncate">
                            <FileText size={11} />
                            {r.reason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Reschedule toggle */}
                      {r.status !== "completed" && r.status !== "cancelled" && (
                        <button
                          onClick={() => setRescheduling(rescheduling === r.id ? null : r.id)}
                          title="Reporter"
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          {rescheduling === r.id ? <X size={14} /> : <Pencil size={14} />}
                        </button>
                      )}
                      {/* Status select */}
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value as AppointmentRow["status"])}
                        className="text-xs px-2 py-1 border-0 bg-white/60 cursor-pointer font-medium rounded"
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Inline reschedule form */}
                  {rescheduling === r.id && (
                    <RescheduleForm
                      appointment={r}
                      onSave={(date, time) => reschedule(r.id, date, time)}
                      onCancel={() => setRescheduling(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full list */}
      <div className="mt-8 bg-vc-white border border-vc-mist overflow-x-auto">
        <div className="px-4 py-3 border-b border-vc-mist">
          <p className="text-xs tracking-widest uppercase text-vc-slate font-medium">
            Tous les rendez-vous ({rows.length})
          </p>
        </div>
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
              <tr
                key={r.id}
                className="hover:bg-vc-mist/50 cursor-pointer"
                onClick={() => { setSelected(parseISO(r.preferred_date)); setRescheduling(null); }}
              >
                <td className="px-4 py-3 font-medium text-vc-dark">{r.full_name}</td>
                <td className="px-4 py-3 text-vc-slate">
                  <a href={`tel:${r.phone}`} className="hover:text-vc-teal" onClick={(e) => e.stopPropagation()}>
                    {r.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-vc-slate">{r.preferred_date}</td>
                <td className="px-4 py-3 text-vc-slate">{r.preferred_time}</td>
                <td className="px-4 py-3 text-vc-silver max-w-xs truncate">{r.reason ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 border font-medium ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
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
