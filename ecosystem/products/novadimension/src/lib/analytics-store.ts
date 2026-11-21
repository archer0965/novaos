import { get, put } from "@vercel/blob";
import {
  emptyDaily,
  type DailyStats,
  type MetricKey,
  taipeiDate,
} from "@/lib/analytics";

function dailyPath(date: string) {
  return `analytics/daily/${date}.json`;
}

async function readDaily(date: string, token: string): Promise<DailyStats> {
  try {
    const result = await get(dailyPath(date), {
      access: "private",
      token,
    });
    if (!result?.stream) return emptyDaily(date);
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as Partial<DailyStats>;
    return {
      date,
      visits: Number(parsed.visits) || 0,
      consultations: Number(parsed.consultations) || 0,
      reviews: Number(parsed.reviews) || 0,
    };
  } catch {
    return emptyDaily(date);
  }
}

async function writeDaily(stats: DailyStats, token: string) {
  await put(dailyPath(stats.date), JSON.stringify(stats), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token,
    cacheControlMaxAge: 0,
  });
}

export async function incrementMetric(
  metric: MetricKey,
  amount = 1,
): Promise<DailyStats | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  const date = taipeiDate();
  // Retry a few times for light concurrency
  let latest = await readDaily(date, token);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    latest = {
      ...latest,
      [metric]: latest[metric] + amount,
    };
    try {
      await writeDaily(latest, token);
      return latest;
    } catch {
      latest = await readDaily(date, token);
    }
  }
  return latest;
}

export async function readMetricsForDates(
  dates: string[],
): Promise<DailyStats[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return dates.map(emptyDaily);

  const rows = await Promise.all(dates.map((date) => readDaily(date, token)));
  return rows;
}
