import { AuthForm } from "@/components/auth/auth-form";
import { resolveAuthNext } from "@/lib/trusted-returns";

export const metadata = { title: "登入" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <AuthForm mode="login" nextPath={resolveAuthNext(searchParams.next)} />
  );
}
