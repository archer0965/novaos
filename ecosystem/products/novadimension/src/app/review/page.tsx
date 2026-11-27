import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewForm from "@/components/ReviewForm";

export const metadata: Metadata = {
  title: "留下評論",
  description: "分享你的 3D 軟裝設計體驗，幫助更多人看見理想空間的可能。",
  alternates: {
    canonical: "/review",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReviewPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="section-pad pt-28 md:pt-32">
          <div className="section-shell">
            <Link
              href="/#cases"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={16} aria-hidden />
              回到客戶好評
            </Link>

            <div className="mx-auto mt-8 max-w-2xl text-center">
              <p className="eyebrow justify-center">客戶回饋</p>
              <h1 className="headline mt-3 text-[clamp(1.85rem,4.2vw,2.85rem)]">
                留下你的評論
              </h1>
              <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
                歡迎分享你的空間體驗。我們專注於 3D
                軟裝設計提案，你的真實回饋會顯示在首頁客戶好評區。
              </p>
            </div>

            <div className="mt-10">
              <ReviewForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
