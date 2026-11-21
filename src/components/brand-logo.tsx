import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MARK_SIZES = {
  sm: 28,
  md: 36,
  lg: 52,
} as const;

/** 拓新雲端 NovaOS brand mark（雲＋勾選漸層圖騰） */
export function NovaMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand-mark.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority={size >= 36}
    />
  );
}

export function BrandLogo({
  className,
  href = "/",
  size = "md",
  markOnly = false,
  /** 行銷深色底時用較亮的文字 */
  variant = "auto",
}: {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  variant?: "auto" | "light" | "dark";
}) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-3xl md:text-5xl",
  };
  const markPx = MARK_SIZES[size];
  const titleClass =
    variant === "light"
      ? "text-white"
      : variant === "dark"
        ? "text-slate-900"
        : "text-inherit";
  const subClass =
    variant === "light"
      ? "text-white/70"
      : variant === "dark"
        ? "text-slate-500"
        : "text-muted-foreground";

  return (
    <Link
      href={href}
      className={cn(
        "font-display inline-flex items-center gap-2.5 font-bold tracking-tight",
        textSizes[size],
        titleClass,
        className
      )}
    >
      <NovaMark size={markPx} />
      {markOnly ? (
        <span className="sr-only">拓新雲端 NovaOS</span>
      ) : (
        <span className="leading-none">
          <span
            className={cn(
              "block text-[0.62em] font-semibold tracking-[0.12em]",
              subClass
            )}
          >
            拓新雲端
          </span>
          <span className="tracking-tight">NovaOS</span>
        </span>
      )}
    </Link>
  );
}
