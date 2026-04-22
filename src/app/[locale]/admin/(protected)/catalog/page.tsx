"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { CatalogProductRow } from "@/types/database.types";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const EMPTY_PRODUCT: Partial<CatalogProductRow> = {
  name: "",
  category: "frames",
  brand: "",
  price: 0,
  stock: 0,
  description_fr: "",
  description_ar: "",
  is_active: true,
};

export default function CatalogAdminPage() {
  const [rows, setRows] = useState<CatalogProductRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newProd, setNewProd] = useState<Partial<CatalogProductRow>>({
    ...EMPTY_PRODUCT,
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sb = getSupabaseBrowserClient();

  async function load() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from("catalog_products")
      .select("*")
      .order("name");
    setRows((data ?? []) as CatalogProductRow[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, val: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any)
      .from("catalog_products")
      .update({ is_active: val })
      .eq("id", id);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: val } : r)),
    );
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    const row = rows.find((r) => r.id === id);
    if (row?.image_path) {
      await fetch("/api/internal/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: row.image_path }),
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("catalog_products").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Produit supprimé");
  }

  async function uploadImage(
    file: File,
  ): Promise<{ url: string; path: string } | null> {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/internal/upload", {
      method: "POST",
      body: form,
    });
    setUploading(false);
    if (!res.ok) {
      const { error } = await res.json();
      toast.error(`Erreur upload: ${error ?? res.statusText}`);
      return null;
    }
    return res.json();
  }

  async function create() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any)
      .from("catalog_products")
      .insert(newProd);
    if (error) toast.error("Erreur");
    else {
      toast.success("Produit créé");
      setAdding(false);
      setNewProd({ ...EMPTY_PRODUCT });
      load();
    }
  }

  async function save(id: string, updates: Partial<CatalogProductRow>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any)
      .from("catalog_products")
      .update(updates)
      .eq("id", id);
    if (error) toast.error("Erreur");
    else {
      toast.success("Enregistré");
      load();
      setEditing(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-vc-dark">Catalogue</h1>
        <Button
          onClick={() => setAdding(!adding)}
          className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs tracking-widest uppercase gap-2"
        >
          <Plus size={14} /> Ajouter un produit
        </Button>
      </div>

      {adding && (
        <ProductForm
          product={newProd as CatalogProductRow}
          onChange={(f, v) => setNewProd({ ...newProd, [f]: v })}
          onSave={create}
          onCancel={() => setAdding(false)}
          onImageUpload={async (f) => {
            const result = await uploadImage(f);
            if (result)
              setNewProd({
                ...newProd,
                image_url: result.url,
                image_path: result.path,
              });
          }}
          uploading={uploading}
          fileRef={fileRef}
          isNew
        />
      )}

      <div className="bg-vc-white border border-vc-mist overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-vc-mist text-vc-slate text-xs tracking-widest uppercase">
            <tr>
              <th className="px-4 py-3 text-start">Image</th>
              <th className="px-4 py-3 text-start">Produit</th>
              <th className="px-4 py-3 text-start">Catégorie</th>
              <th className="px-4 py-3 text-start">Prix</th>
              <th className="px-4 py-3 text-start">Stock</th>
              <th className="px-4 py-3 text-start">Actif</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vc-mist">
            {rows.map((r) => (
              <React.Fragment key={r.id}>
                <tr className="hover:bg-vc-mist/40">
                  <td className="px-4 py-3">
                    {r.image_url ? (
                      <div className="relative w-14 h-14 overflow-hidden bg-vc-mist group/img cursor-zoom-in">
                        <Image
                          src={r.image_url}
                          alt={r.name}
                          fill
                          className="object-fill transition-transform duration-300 group-hover/img:scale-125"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-vc-mist flex items-center justify-center text-vc-silver/50">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-vc-dark">{r.name}</p>
                    <p className="text-vc-silver text-xs">{r.brand}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-vc-slate">
                    {r.category}
                  </td>
                  <td className="px-4 py-3 text-vc-teal font-medium">
                    {formatPrice(r.price, "fr")}
                  </td>
                  <td className="px-4 py-3 text-vc-slate">{r.stock}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={r.is_active}
                      onCheckedChange={(v) => toggle(r.id, v)}
                    />
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setEditing(editing === r.id ? null : r.id)}
                      className="text-vc-teal text-xs hover:underline"
                    >
                      {editing === r.id ? "Fermer" : "Modifier"}
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-vc-silver hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
                {editing === r.id && (
                  <tr key={`edit-${r.id}`}>
                    <td colSpan={7} className="px-4 pb-4 bg-vc-mist/30">
                      <ProductForm
                        product={r}
                        onChange={() => {}}
                        onSave={(updates) => save(r.id, updates)}
                        onCancel={() => setEditing(null)}
                        onImageUpload={async (f) => {
                          const result = await uploadImage(f);
                          if (result) {
                            await save(r.id, {
                              image_url: result.url,
                              image_path: result.path,
                            });
                          }
                        }}
                        uploading={uploading}
                        fileRef={fileRef}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center py-12 text-vc-silver">
            Aucun produit. Ajoutez-en un !
          </p>
        )}
      </div>
    </div>
  );
}

function ProductForm({
  product,
  onChange,
  onSave,
  onCancel,
  onImageUpload,
  uploading,
  fileRef,
  isNew,
}: {
  product: CatalogProductRow;
  onChange: (field: string, value: string | number | boolean) => void;
  onSave: (updates: Partial<CatalogProductRow>) => void;
  onCancel: () => void;
  onImageUpload: (f: File) => Promise<void>;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  isNew?: boolean;
}) {
  const [vals, setVals] = useState({ ...product });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (f: string, v: any) => {
    setVals((p) => ({ ...p, [f]: v }));
    onChange(f, v);
  };

  return (
    <div className="bg-vc-white border border-vc-teal/30 p-6 mt-3 space-y-4">
      <p className="font-medium text-vc-dark text-sm">
        {isNew ? "Nouveau produit" : `Modifier — ${product.name}`}
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs mb-1 block">Nom</Label>
          <Input
            value={vals.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Marque</Label>
          <Input
            value={vals.brand}
            onChange={(e) => set("brand", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Catégorie</Label>
          <Select
            value={vals.category ?? "frames"}
            onValueChange={(v) => set("category", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frames">Montures</SelectItem>
              <SelectItem value="lenses">Lentilles</SelectItem>
              <SelectItem value="sunglasses">Solaires</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Prix (DA)</Label>
          <Input
            type="number"
            value={vals.price}
            onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Stock</Label>
          <Input
            type="number"
            value={vals.stock}
            onChange={(e) => set("stock", parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Image</Label>
          <div className="flex items-center gap-2">
            {vals.image_url && (
              <div className="relative w-12 h-12 overflow-hidden bg-vc-mist">
                <Image
                  src={vals.image_url}
                  alt=""
                  fill
                  className="object-fill"
                  sizes="48px"
                />
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs"
            >
              {uploading ? "Upload…" : "Choisir"}
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await onImageUpload(f);
              }}
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <Label className="text-xs mb-1 block">Description (FR)</Label>
          <Input
            value={vals.description_fr ?? ""}
            onChange={(e) => set("description_fr", e.target.value)}
          />
        </div>
        <div className="md:col-span-3" dir="rtl">
          <Label className="text-xs mb-1 block">الوصف (AR)</Label>
          <Input
            value={vals.description_ar ?? ""}
            onChange={(e) => set("description_ar", e.target.value)}
            className="font-arabic"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => onSave(vals)}
          className="bg-vc-teal hover:bg-[#0e9fcc] text-white text-xs tracking-widest uppercase"
        >
          {isNew ? "Créer" : "Enregistrer"}
        </Button>
        <Button variant="outline" onClick={onCancel} className="text-xs">
          Annuler
        </Button>
      </div>
    </div>
  );
}
