import ConsultationForm from "@/components/ConsultationForm";

export default function CTA() {
  return (
    <section id="contact" className="section-pad pt-0">
      <div className="section-shell">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-[rgba(255,250,245,0.55)] px-5 py-12 md:px-10 md:py-16">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-sand/80 blur-2xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">預約設計諮詢</p>
            <h2 className="headline mt-3 text-[clamp(1.75rem,4.2vw,2.75rem)]">
              預約 3D 軟裝設計提案
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
              填寫基本空間需求，我們會透過 IG 私訊與您聯繫，為您量身打造專屬的空間靈感。
            </p>
          </div>

          <div className="relative mt-10">
            <ConsultationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
