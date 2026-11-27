export type ListParams = {
  page: number;
  pageSize: number;
  q: string;
  from: string | null;
  to: string | null;
  status: string | null;
};

export function parseListParams(url: URL): ListParams {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(5, Number(url.searchParams.get("pageSize") || 20) || 20)
  );
  const q = (url.searchParams.get("q") || "").trim();
  const from = url.searchParams.get("from")?.trim() || null;
  const to = url.searchParams.get("to")?.trim() || null;
  const status = url.searchParams.get("status")?.trim() || null;
  return { page, pageSize, q, from, to, status };
}

export function toIsoRange(from: string | null, to: string | null) {
  const fromIso = from ? `${from}T00:00:00.000Z` : null;
  const toIso = to ? `${to}T23:59:59.999Z` : null;
  return { fromIso, toIso };
}
