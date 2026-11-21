"use client";

import { FormEvent, useState } from "react";
import { Camera, CheckCircle2, Send } from "lucide-react";
import { IG_DM_URL, SPACE_TYPES, type SpaceType } from "@/lib/constants";

type FormState = {
  name: string;
  instagram: string;
  spaceType: SpaceType | "";
  spaceNote: string;
};

const initialState: FormState = {
  name: "",
  instagram: "",
  spaceType: "",
  spaceNote: "",
};

export default function ConsultationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const instagram = form.instagram.trim();

    if (!name || !instagram || !form.spaceType) {
      setError("請填寫稱呼、Instagram 帳號，並選擇空間類型。");
      return;
    }

    setSubmitting(true);
    setError("");

    const summary = [
      "【拓維空間NovaDimension｜3D 軟裝設計預約】",
      `稱呼：${name}`,
      `IG：${instagram}`,
      `空間類型：${form.spaceType}`,
      form.spaceNote.trim()
        ? `現況說明：${form.spaceNote.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          instagram,
          spaceType: form.spaceType,
          spaceNote: form.spaceNote.trim(),
          website: honeypot,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "送出失敗，請稍後再試。");
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(summary).catch(() => undefined);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="soft-panel mx-auto max-w-xl px-6 py-10 text-center md:px-10"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <CheckCircle2 size={28} strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
          預約已送出！
        </h3>
        <p className="mt-3 text-base leading-7 text-ink-muted">
          我們會盡快透過 IG 私訊您，請留意您的私訊要求（或陌生訊息）。預約摘要也已複製到剪貼簿。
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={IG_DM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full sm:w-auto"
          >
            <Camera size={18} aria-hidden />
            點此直接私訊 IG 帳號
          </a>
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => {
              setSubmitted(false);
              setForm(initialState);
              setHoneypot("");
              setError("");
            }}
          >
            再填一份
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="soft-panel relative mx-auto max-w-xl px-6 py-8 md:px-10 md:py-10"
      noValidate
    >
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="consult-website">網站</label>
        <input
          id="consult-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="consult-name" className="form-label">
            您的稱呼 / 姓名 <span className="text-accent">*</span>
          </label>
          <input
            id="consult-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="form-field"
            placeholder="例如：小維"
          />
        </div>

        <div>
          <label htmlFor="consult-ig" className="form-label">
            您的 Instagram 帳號 <span className="text-accent">*</span>
          </label>
          <input
            id="consult-ig"
            name="instagram"
            type="text"
            required
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            className="form-field"
            placeholder="例如 @tuowei_space，方便我們私訊您"
          />
        </div>

        <fieldset>
          <legend className="form-label mb-3">
            欲改造的空間類型 <span className="text-accent">*</span>
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {SPACE_TYPES.map((type) => {
              const selected = form.spaceType === type;
              return (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm transition-colors ${
                    selected
                      ? "border-accent/40 bg-accent/5 text-ink"
                      : "border-line bg-ivory/70 text-ink-muted hover:border-accent/25 hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="spaceType"
                    value={type}
                    checked={selected}
                    onChange={() => update("spaceType", type)}
                    className="sr-only"
                  />
                  <span
                    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-accent" : "border-line"
                    }`}
                    aria-hidden
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selected ? "bg-accent" : "bg-transparent"
                      }`}
                    />
                  </span>
                  {type}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="consult-note" className="form-label">
            空間坪數與現況說明{" "}
            <span className="font-normal text-ink-muted">（選填）</span>
          </label>
          <textarea
            id="consult-note"
            name="spaceNote"
            rows={4}
            value={form.spaceNote}
            onChange={(e) => update("spaceNote", e.target.value)}
            className="form-field min-h-[7.5rem] resize-y"
            placeholder="例如：約 5 坪，希望能規劃出有書桌與奶油風氛圍的臥室"
          />
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
        <Send size={18} aria-hidden />
        {submitting ? "送出中…" : "送出預約（透過 IG 聯繫）"}
      </button>

      <p className="mt-4 text-center text-xs leading-6 text-ink-muted">
        我們專注於 3D 空間配置與軟裝設計提案，不提供代購或實體產品介紹。
        送出即表示你同意我們透過 IG 與你聯繫。
      </p>
    </form>
  );
}
