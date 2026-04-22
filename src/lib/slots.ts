// Generates 30-minute appointment slots based on clinic hours
// Sat–Wed: 09:00–19:00 | Thu: 09:00–17:00 | Fri: closed
// JS getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

export const SLOT_DURATION = 30; // minutes

function range(startH: number, endH: number): string[] {
  const slots: string[] = [];
  let h = startH;
  let m = 0;
  while (h < endH || (h === endH && m === 0)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += SLOT_DURATION;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
}

export function getSlotsForDate(dateStr: string): string[] {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay(); // 0=Sun … 6=Sat
  if (day === 5) return []; // Friday — closed
  if (day === 4) return range(9, 17); // Thursday 09:00–17:00 (last slot 16:30)
  return range(9, 19); // Sat–Wed 09:00–19:00 (last slot 18:30)
}

export const ALL_VALID_SLOTS: string[] = range(9, 19);
