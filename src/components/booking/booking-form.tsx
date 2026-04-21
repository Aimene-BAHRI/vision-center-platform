"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  preferred_date: z.string().min(1),
  preferred_time: z.enum(["morning", "afternoon", "evening"]),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function BookingForm() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const res = await fetch("/api/internal/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, locale }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      setServerError(t("error"));
    }
  }

  if (success) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-4">
        <CheckCircle size={56} className="text-vc-teal" />
        <h2 className="font-heading text-3xl text-vc-dark">{t("success_title")}</h2>
        <p className="text-vc-silver max-w-sm">{t("success_body")}</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("fullName")}</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" {...register("email")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="preferred_date">{t("preferredDate")}</Label>
          <Input id="preferred_date" type="date" min={today} {...register("preferred_date")} />
          {errors.preferred_date && <p className="text-red-500 text-xs">{errors.preferred_date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{t("preferredTime")}</Label>
          <Select onValueChange={(v) => setValue("preferred_time", v as "morning" | "afternoon" | "evening")}>
            <SelectTrigger>
              <SelectValue placeholder={t("preferredTime")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">{t("time_morning")}</SelectItem>
              <SelectItem value="afternoon">{t("time_afternoon")}</SelectItem>
              <SelectItem value="evening">{t("time_evening")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferred_time && <p className="text-red-500 text-xs">{errors.preferred_time.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">{t("reason")}</Label>
        <Textarea id="reason" {...register("reason")} rows={3} />
      </div>

      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-vc-teal hover:bg-[#0e9fcc] text-white tracking-widest uppercase"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
