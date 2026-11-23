import { redirect } from "next/navigation";
import { getNovaOsLoginUrl } from "@/lib/novaos-hub";

export const metadata = { title: "登入｜拓維空間" };

export default function LoginPage() {
  redirect(getNovaOsLoginUrl());
}
