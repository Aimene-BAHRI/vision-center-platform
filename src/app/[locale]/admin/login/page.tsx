"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = getSupabaseBrowserClient();
    const { error: authError } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(t("login_error"));
    } else {
      router.push(`/${locale}/admin`);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-vc-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-vc-navy p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center text-vc-teal mb-3">
            <Eye size={32} />
          </div>
          <h1 className="font-heading text-2xl text-vc-white">{t("login_title")}</h1>
          <p className="text-vc-silver text-sm mt-1">Vision Center Admin</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-vc-silver">{t("login_email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-vc-slate border-white/20 text-vc-white placeholder:text-vc-silver/50 focus:border-vc-teal"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-vc-silver">{t("login_password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-vc-slate border-white/20 text-vc-white focus:border-vc-teal"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-vc-teal hover:bg-[#0e9fcc] text-white tracking-widest uppercase"
          >
            {loading ? "…" : t("login_submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
