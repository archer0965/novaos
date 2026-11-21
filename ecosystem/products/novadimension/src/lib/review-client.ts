import type { Review } from "@/lib/reviews";

export const PENDING_REVIEW_KEY = "novadimension:pending-review";

export function stashPendingReview(review: Review) {
  try {
    sessionStorage.setItem(PENDING_REVIEW_KEY, JSON.stringify(review));
  } catch {
    // ignore quota / private mode failures
  }
}

export function takePendingReview(): Review | null {
  try {
    const raw = sessionStorage.getItem(PENDING_REVIEW_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_REVIEW_KEY);
    return JSON.parse(raw) as Review;
  } catch {
    return null;
  }
}

export function mergeReviews(existing: Review[], incoming: Review[]): Review[] {
  const map = new Map<string, Review>();
  for (const item of [...incoming, ...existing]) {
    map.set(item.id, item);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
