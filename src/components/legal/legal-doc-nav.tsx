import Link from "next/link";
import { LEGAL_DOCS, type LegalDocId } from "@/lib/legal";
import { cn } from "@/lib/utils";

export function LegalDocNav({
  active,
  className,
}: {
  active: LegalDocId;
  className?: string;
}) {
  return (
    <nav
      aria-label="條款與政策導覽"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {LEGAL_DOCS.map((doc) => {
        const isActive = doc.id === active;
        return (
          <Link
            key={doc.id}
            href={doc.href}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/80 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {doc.shortTitle}
          </Link>
        );
      })}
    </nav>
  );
}
