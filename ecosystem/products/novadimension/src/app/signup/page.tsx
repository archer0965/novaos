import { redirect } from "next/navigation";
import { getNovaOsSignupUrl } from "@/lib/novaos-hub";

export const metadata = { title: "註冊｜拓維空間" };

export default function SignupPage() {
  redirect(getNovaOsSignupUrl());
}
