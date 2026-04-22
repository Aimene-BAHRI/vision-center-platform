import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Calendar, Package, Star, Clock } from "lucide-react";

async function getStats() {
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [
    { count: products },
    { count: pending },
    { count: testimonials },
    { count: services },
  ] = await Promise.all([
    sb.from("catalog_products").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("testimonials").select("*", { count: "exact", head: true }).eq("is_visible", true),
    sb.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);
  return { products: products ?? 0, pending: pending ?? 0, testimonials: testimonials ?? 0, services: services ?? 0 };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Produits actifs", value: stats.products, icon: <Package size={24} />, color: "text-vc-teal" },
    { label: "RDV en attente", value: stats.pending, icon: <Clock size={24} />, color: "text-amber-500" },
    { label: "Témoignages visibles", value: stats.testimonials, icon: <Star size={24} />, color: "text-purple-500" },
    { label: "Services actifs", value: stats.services, icon: <Calendar size={24} />, color: "text-green-500" },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl text-vc-dark mb-8">Tableau de bord</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-vc-white border border-vc-mist p-6 space-y-3">
            <div className={c.color}>{c.icon}</div>
            <p className="font-heading text-4xl text-vc-dark">{c.value}</p>
            <p className="text-vc-silver text-sm">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
