"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Draft = {
  id: string;
  doc_type: string;
  title: string;
  content: string;
  updated_at: string;
};

const TEMPLATES: Record<string, { title: string; build: (shop: string) => string }> = {
  waiver: {
    title: "美業服務免責聲明",
    build: (shop) =>
      `${shop} 美業服務免責聲明\n\n一、本人了解並同意接受服務過程可能之風險。\n二、本人已如實告知過敏史、慢性病與懷孕等狀況。\n三、若因個人體質或未遵循術後保養導致不適，工作室不負額外賠償責任。\n四、本聲明經簽署後生效。\n\n簽署人：__________  日期：__________`,
  },
  contract: {
    title: "美業課程／方案合約",
    build: (shop) =>
      `${shop} 服務合約\n\n甲方（工作室）：${shop}\n乙方（顧客）：__________\n\n1. 服務內容：__________\n2. 費用與付款方式：依雙方約定（現場付／轉帳）\n3. 改期須於 24 小時前通知。\n4. 未依約出席視同消耗該次服務。\n\n甲方簽章：______  乙方簽章：______`,
  },
  aftercare: {
    title: "術後保養須知",
    build: (shop) =>
      `${shop} 術後保養須知\n\n1. 24 小時內避免沾水與劇烈運動。\n2. 依指示使用保養品，勿自行添加刺激性成分。\n3. 如有紅腫熱痛加劇，請立即聯繫工作室。\n4. 本須知僅供參考，實際以現場評估為準。`,
  },
};

export function AiDocPanel({
  shopName,
  initialDrafts,
}: {
  shopName: string;
  initialDrafts: Draft[];
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [docType, setDocType] = useState<keyof typeof TEMPLATES>("waiver");
  const [title, setTitle] = useState(TEMPLATES.waiver.title);
  const [content, setContent] = useState(TEMPLATES.waiver.build(shopName));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  function applyTemplate(type: keyof typeof TEMPLATES) {
    setDocType(type);
    setTitle(TEMPLATES[type].title);
    setContent(TEMPLATES[type].build(shopName));
  }

  async function saveDraft() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-doc/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: docType, title, content }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "儲存失敗");
      setDrafts((prev) => [json.draft, ...prev]);
      toast.success("草稿已儲存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setLoading(false);
    }
  }

  function askLocal() {
    const q = question.trim();
    if (!q) return;
    const hay = `${title}\n${content}`.toLowerCase();
    const hit = q
      .split(/\s+/)
      .filter(Boolean)
      .some((w) => hay.includes(w.toLowerCase()));
    setAnswer(
      hit
        ? `依目前草稿內容，與「${q}」相關段落已存在於文件中。建議保留免責與改期條款，並請顧客親簽確認。`
        : `草稿中未直接提到「${q}」。建議在合約加註：付款方式與取消政策以雙方約定為準。`
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-violet-50 via-background to-sky-50/50 p-5 md:p-6">
        <p className="text-sm text-muted-foreground">📄 Nova AI Doc</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">美業文件產生與問答</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          一鍵產生合約／免責聲明／術後須知，並可針對草稿內容快速問答（本機規則引擎，無需外連）。
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>).map((key) => (
          <Button
            key={key}
            type="button"
            variant={docType === key ? "default" : "outline"}
            onClick={() => applyTemplate(key)}
          >
            {TEMPLATES[key].title}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">標題</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-content">內容</Label>
            <Textarea
              id="doc-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[280px] font-mono text-sm"
            />
          </div>
          <Button type="button" className="h-11" disabled={loading} onClick={saveDraft}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            儲存草稿
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border bg-card/70 p-4">
          <p className="inline-flex items-center gap-1.5 font-medium">
            <Sparkles className="h-4 w-4" />
            草稿問答
          </p>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：改期怎麼規定？"
          />
          <Button type="button" variant="outline" onClick={askLocal}>
            解析回答
          </Button>
          {answer ? (
            <p className="rounded-xl bg-secondary/60 px-3 py-3 text-sm leading-relaxed">
              {answer}
            </p>
          ) : null}

          <div className="pt-2">
            <p className="text-sm font-medium">最近草稿</p>
            <ul className="mt-2 space-y-2 text-sm">
              {drafts.length ? (
                drafts.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className="text-left text-primary hover:underline"
                      onClick={() => {
                        setTitle(d.title);
                        setContent(d.content);
                        setDocType((d.doc_type as keyof typeof TEMPLATES) || "waiver");
                      }}
                    >
                      {d.title}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">尚無草稿</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
