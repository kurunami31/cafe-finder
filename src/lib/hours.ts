const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDays(part: string): number[] {
  const days: number[] = [];
  for (const chunk of part.split(",")) {
    const range = chunk.trim().split("-");
    if (range.length === 2 && DAY_NAMES.includes(range[0]) && DAY_NAMES.includes(range[1])) {
      let start = DAY_NAMES.indexOf(range[0]);
      const end = DAY_NAMES.indexOf(range[1]);
      while (start !== end) {
        days.push(start);
        start = (start + 1) % 7;
      }
      days.push(end);
    } else if (DAY_NAMES.includes(chunk.trim())) {
      days.push(DAY_NAMES.indexOf(chunk.trim()));
    }
  }
  return days;
}

function parseTime(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function davaoNow(): { day: number; minutes: number } {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ph = new Date(utc + 8 * 3600000);
  return { day: ph.getDay(), minutes: ph.getHours() * 60 + ph.getMinutes() };
}

export function isOpenNow(openingHours: string | null): boolean | null {
  if (!openingHours || openingHours === "24/7") {
    return openingHours === "24/7" ? true : null;
  }
  const { day, minutes } = davaoNow();
  for (const rule of openingHours.split(";")) {
    const trimmed = rule.trim();
    if (/^24\/7$/i.test(trimmed)) return true;
    const timeMatch = trimmed.match(/^(.*?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (!timeMatch) continue;
    const days = timeMatch[1] ? parseDays(timeMatch[1]) : [0, 1, 2, 3, 4, 5, 6];
    if (!days.includes(day)) continue;
    const open = parseTime(timeMatch[2]);
    const close = parseTime(timeMatch[3]);
    if (open === null || close === null) continue;
    if (close <= open) {
      if (minutes >= open || minutes < close) return true;
    } else if (minutes >= open && minutes < close) {
      return true;
    }
  }
  return false;
}

export function formatAddress(cafe: {
  street: string | null;
  barangay: string | null;
  district: string | null;
}): string {
  return [cafe.street, cafe.barangay, cafe.district].filter(Boolean).join(", ");
}
