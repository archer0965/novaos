"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Star } from "lucide-react";
import { SPACE_TYPES, type SpaceType } from "@/lib/constants";
import { stashPendingReview } from "@/lib/review-client";
import type { Review } from "@/lib/reviews";

type FormState = {
  name: string;
  space: SpaceType | "";
  rating: number;
  quote: string;
};

const initialState: FormState = {
  name: "",
  space: "",
  rating: 5,
  quote: "",
};

export default function ReviewForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const quote = form.quote.trim();

    if (!name || !form.space || !quote) {
      setError("請填寫暱稱、空間類型與評論內容。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          space: form.space,
          rating: form.rating,
          quote,
          website: honeypot,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        review?: Review;
      };
      if (!response.ok || !data.review) {
        throw new Error(data.error || "送出失敗，請稍後再試。");
      }

      stashPendingReview(data.review);
      router.push("/?newReview=1#testimonials");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出失敗，請稍後再試。");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="soft-panel relative mx-auto max-w-xl px-6 py-8 md:px-10 md:py-10"
      noValidate
    >
      <div className="space-y-6">
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
          <label htmlFor="review-website">網站</label>
          <input
            id="review-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="review-name" className="form-label">
            您的暱稱 <span className="text-accent">*</span>
          </label>
          <input
            id="review-name"
            type="text"
            required
            maxLength={40}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="form-field"
            placeholder="例如：台中李小姐"
          />
        </div>

        <div>
          <label htmlFor="review-space" className="form-label">
            空間類型 <span className="text-accent">*</span>
          </label>
          <select
            id="review-space"
            required
            value={form.space}
            onChange={(e) => update("space", e.target.value as SpaceType | "")}
            className="form-field"
          >
            <option value="" disabled>
              請選擇空間類型
            </option>
            {SPACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="form-label mb-3">
            評分 <span className="text-accent">*</span>
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = form.rating >= value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                    active
                      ? "border-[#d4a017]/40 bg-[#d4a017]/10 text-[#d4a017]"
                      : "border-line bg-ivory text-ink-muted"
                  }`}
                  aria-label={`${value} 星`}
                  aria-pressed={form.rating === value}
                  onClick={() => update("rating", value)}
                >
                  <Star
                    size={18}
                    className={active ? "fill-[#d4a017]" : ""}
                    strokeWidth={1.7}
                  />
                </button>
              );
            })}
            <span className="ml-1 text-sm text-ink-muted">{form.rating} / 5</span>
          </div>
        </fieldset>

        <div>
          <label htmlFor="review-quote" className="form-label">
            評論內容 <span className="text-accent">*</span>
          </label>
          <textarea
            id="review-quote"
            required
            maxLength={500}
            rows={5}
            value={form.quote}
            onChange={(e) => update("quote", e.target.value)}
            className="form-field min-h-[8.5rem] resize-y"
            placeholder="分享你的空間改造體驗，例如設計圖是否清楚、風格是否符合期待…"
          />
          <p className="mt-2 text-xs text-ink-muted">
            {form.quote.trim().length}/500
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-5 text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary mt-8 w-full"
        disabled={submitting}
      >
        <Send size={18} />
        {submitting ? "送出中…" : "送出評論"}
      </button>
    </form>
  );
}
