import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: string) {
  return locale === "ar"
    ? `${amount.toLocaleString("ar-DZ")} دج`
    : `${amount.toLocaleString("fr-DZ")} DA`;
}

export function isOpenNow(): boolean {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Algiers" })
  );
  const day = now.getDay(); // 0=Sun, 5=Fri
  const hour = now.getHours();
  const min = now.getMinutes();
  const time = hour * 60 + min;

  if (day === 5) return false; // Friday closed
  if (day === 4) return time >= 9 * 60 && time < 17 * 60; // Thursday 9–17
  return time >= 9 * 60 && time < 19 * 60; // Sat–Wed 9–19
}
