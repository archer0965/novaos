"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function MobileStickyCTA() {
  const pathname = usePathname();
  const [scrolledEnough, setScrolledEnough] = useState(false);
  const [awayFromStudio, setAwayFromStudio] = useState(true);

  useEffect(() => {
    if (pathname !== "/") return;

    const onScroll = () => {
      const studio = document.getElementById("studio");
      const studioTop = studio?.getBoundingClientRect().top ?? 9999;
      setScrolledEnough(window.scrollY > 420);
      setAwayFromStudio(studioTop >= window.innerHeight * 0.85);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname !== "/" || !scrolledEnough || !awayFromStudio) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[rgba(253,251,247,0.94)] p-3 backdrop-blur-xl md:hidden">
      <Link href="/#studio" className="btn btn-primary w-full">
        <Sparkles size={18} aria-hidden />
        免費試用 1 次
      </Link>
    </div>
  );
}
