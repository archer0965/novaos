"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquarePlus, Star } from "lucide-react";
import { averageRating, type Review } from "@/lib/reviews";
import { mergeReviews, takePendingReview } from "@/lib/review-client";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} 顆星`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={index}
            size={16}
            strokeWidth={1.6}
            className={filled ? "fill-[#d4a017] text-[#d4a017]" : "text-sand"}
          />
        );
      })}
    </div>
  );
}

function TestimonialCard({
  item,
  highlight,
}: {
  item: Review;
  highlight?: boolean;
}) {
  return (
    <article
      id={highlight ? `review-${item.id}` : undefined}
      className={`soft-panel flex h-full flex-col p-5 md:p-6 ${
        highlight ? "ring-2 ring-accent/35 ring-offset-2 ring-offset-cream" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold tracking-tight text-ink">
            {item.name}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{item.space}</p>
        </div>
        <Stars rating={item.rating} />
      </div>
      <p className="mt-5 flex-1 text-[0.98rem] leading-7 text-ink-muted">
        「{item.quote}」
      </p>
    </article>
  );
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const pending = takePendingReview();
      if (pending && active) {
        setReviews((prev) => mergeReviews(prev, [pending]));
        setHighlightId(pending.id);
        setLoading(false);
      }

      try {
        const response = await fetch("/api/reviews", { cache: "no-store" });
        const data = (await response.json()) as { reviews?: Review[] };
        if (!active) return;
        const remote = Array.isArray(data.reviews) ? data.reviews : [];
        setReviews((prev) => mergeReviews(pending ? [pending] : prev, remote));
      } catch {
        if (active && !pending) setReviews([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    const shouldFocus =
      typeof window !== "undefined" &&
      (window.location.hash === "#testimonials" ||
        new URLSearchParams(window.location.search).get("newReview") === "1");

    if (shouldFocus) {
      document
        .getElementById("testimonials")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const node = document.getElementById(`review-${highlightId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, reviews]);

  const avg = averageRating(reviews);

  return (
    <section id="testimonials" className="section-pad bg-[rgba(255,250,245,0.35)]">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">客戶好評與回饋</p>
          <h2 className="headline mt-3 text-[clamp(1.85rem,4vw,2.75rem)]">
            真實體驗，看得見的空間改變
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
            歡迎留下你的設計體驗，幫助更多人看見理想空間的可能。
          </p>
        </div>

        <div className="soft-panel mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 px-6 py-7 text-center md:px-8">
          {avg != null ? (
            <>
              <p className="font-display text-[clamp(1.8rem,4vw,2.35rem)] font-semibold tracking-tight text-ink">
                {avg.toFixed(1)} <span className="text-ink-muted">/ 5.0</span>
              </p>
              <div className="flex items-center gap-1.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={20}
                    strokeWidth={1.5}
                    className="fill-[#d4a017] text-[#d4a017]"
                  />
                ))}
              </div>
              <p className="text-sm text-ink-muted">
                基於 {reviews.length} 則客戶回饋
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
                尚無評論
              </p>
              <p className="text-sm leading-6 text-ink-muted">
                成為第一位分享體驗的客戶吧
              </p>
            </>
          )}

          <Link href="/review" className="btn btn-primary mt-2">
            <MessageSquarePlus size={18} />
            留下評論
          </Link>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-ink-muted">載入評論中…</p>
        ) : reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {reviews.map((item) => (
              <TestimonialCard
                key={item.id}
                item={item}
                highlight={item.id === highlightId}
              />
            ))}
          </div>
        ) : (
          <div className="soft-panel mx-auto mt-8 max-w-xl px-6 py-10 text-center">
            <p className="text-base leading-7 text-ink-muted">
              目前還沒有公開評論。完成設計體驗後，歡迎點擊上方按鈕留下回饋。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
