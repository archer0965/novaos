import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AiStudio from "@/components/AiStudio";
import Pricing from "@/components/Pricing";
import Cases from "@/components/Cases";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        <Hero />
        <AiStudio />
        <Pricing />
        <Cases />
        <FAQ />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
