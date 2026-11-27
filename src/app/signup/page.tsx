import { AuthForm } from "@/components/auth/auth-form";
import { getAllModuleEarlyBirdStatuses } from "@/lib/module-activation";
import { NOVA_MODULES } from "@/lib/novaos";
import { resolveAuthNext } from "@/lib/trusted-returns";

export const metadata = { title: "免費註冊" };
export const revalidate = 60;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const statuses = await getAllModuleEarlyBirdStatuses().catch(() => []);
  const reliable = statuses.filter((s) => s.reliable !== false);
  const openMods = reliable.filter((s) => s.open);
  const signupHint =
    openMods.length > 0
      ? `註冊不會扣早鳥名額；啟用子模組後才開始試用。目前仍有早鳥名額的模組：${openMods
          .map(
            (s) =>
              `${NOVA_MODULES[s.moduleId].name} 剩餘 ${s.remaining}/${s.max}`
          )
          .join("、")}`
      : reliable.length > 0
        ? "註冊不會開始試用倒數；目前各付費模組早鳥名額已額滿或尚未開放顯示。請登入後至各模組頁點擊「啟用」。"
        : "註冊不會開始試用倒數；請登入後至各模組頁點擊「啟用」（早鳥剩餘名額暫時無法讀取，不顯示虛構數字）。";

  return (
    <div className="min-h-screen">
      <AuthForm
        mode="signup"
        nextPath={resolveAuthNext(searchParams.next)}
        signupHint={signupHint}
      />
    </div>
  );
}
