import { get, list, put } from "@vercel/blob";
import type { Review, ReviewsPayload } from "@/lib/reviews";

const ITEMS_PREFIX = "reviews/items/";

function emptyPayload(): ReviewsPayload {
  return { reviews: [] };
}

async function readBlobText(pathname: string, token: string): Promise<string | null> {
  try {
    const result = await get(pathname, {
      access: "private",
      token,
    });
    if (!result?.stream) return null;
    return await new Response(result.stream).text();
  } catch {
    return null;
  }
}

export async function readReviews(): Promise<ReviewsPayload> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return emptyPayload();
  }

  try {
    const listed = await list({
      prefix: ITEMS_PREFIX,
      token,
    });

    const reviews: Review[] = [];

    for (const blob of listed.blobs) {
      const text = await readBlobText(blob.pathname, token);
      if (!text) continue;
      try {
        const item = JSON.parse(text) as Review;
        if (item?.id && item?.name && item?.quote) {
          reviews.push(item);
        }
      } catch {
        // skip invalid blob
      }
    }

    reviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { reviews };
  } catch {
    return emptyPayload();
  }
}

export async function addReview(
  input: Omit<Review, "id" | "createdAt">,
): Promise<Review> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("缺少 BLOB_READ_WRITE_TOKEN，無法儲存評論。");
  }

  const review: Review = {
    id: `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    space: input.space,
    rating: input.rating,
    quote: input.quote,
    createdAt: new Date().toISOString(),
  };

  await put(`${ITEMS_PREFIX}${review.id}.json`, JSON.stringify(review), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    token,
    cacheControlMaxAge: 0,
  });

  return review;
}
