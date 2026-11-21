import { Suspense } from "react";
import { AuthHandoffClient } from "./handoff-client";

export const metadata = { title: "返回產品站｜拓新雲端" };

export default function AuthHandoffPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">正在返回原網站…</p>
        </main>
      }
    >
      <AuthHandoffClient />
    </Suspense>
  );
}
