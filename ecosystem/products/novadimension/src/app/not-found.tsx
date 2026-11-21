import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex flex-1 items-center">
        <section className="section-shell w-full py-28 text-center md:py-36">
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            404
          </p>
          <h1 className="headline mt-4 text-[clamp(2rem,5vw,3.2rem)]">
            找不到這個頁面
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-ink-muted">
            連結可能已移動或不存在。回到首頁，繼續探索軟裝靈感與 3D 設計提案。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              回到首頁
            </Link>
            <Link href="/#contact" className="btn btn-secondary">
              預約設計提案
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
