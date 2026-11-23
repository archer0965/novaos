export type MetricKey = "visits" | "consultations" | "reviews";

export type DailyStats = {
  date: string;
  visits: number;
  consultations: number;
  reviews: number;
};

export type StatsRange = "1d" | "3d" | "7d" | "30d";

export const STATS_RANGES: { id: StatsRange; label: string; days: number }[] = [
  { id: "1d", label: "今日", days: 1 },
  { id: "3d", label: "3 日", days: 3 },
  { id: "7d", label: "7 日", days: 7 },
  { id: "30d", label: "一個月", days: 30 },
];

export function emptyDaily(date: string): DailyStats {
  return { date, visits: 0, consultations: 0, reviews: 0 };
}

/** Asia/Taipei calendar date YYYY-MM-DD */
export function taipeiDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function listDateKeys(days: number): string[] {
  const today = taipeiDate();
  const [year, month, day] = today.split("-").map(Number);
  const keys: string[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const dt = new Date(Date.UTC(year, month - 1, day - i));
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const d = String(dt.getUTCDate()).padStart(2, "0");
    keys.push(`${y}-${m}-${d}`);
  }

  return keys;
}

export function sumStats(days: DailyStats[]) {
  return days.reduce(
    (acc, day) => ({
      visits: acc.visits + day.visits,
      consultations: acc.consultations + day.consultations,
      reviews: acc.reviews + day.reviews,
    }),
    { visits: 0, consultations: 0, reviews: 0 },
  );
}
