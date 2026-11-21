import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  accent = "indigo",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "indigo" | "cyan" | "amber" | "emerald" | "rose";
}) {
  const ring =
    accent === "cyan"
      ? "from-cyan-500/20 to-transparent"
      : accent === "amber"
        ? "from-amber-500/20 to-transparent"
        : accent === "emerald"
          ? "from-emerald-500/20 to-transparent"
          : accent === "rose"
            ? "from-rose-500/20 to-transparent"
            : "from-indigo-500/20 to-transparent";

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-gradient-to-br p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        ring
      )}
    >
      <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-white">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
