export type Review = {
  id: string;
  name: string;
  space: string;
  rating: number;
  quote: string;
  createdAt: string;
};

export type ReviewsPayload = {
  reviews: Review[];
};

export const REVIEWS_BLOB_PATH = "reviews/index.json";

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, item) => sum + item.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
