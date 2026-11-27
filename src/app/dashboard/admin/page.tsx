import { redirect } from "next/navigation";

export const metadata = {
  title: "管理者後台",
};

/** Legacy path → Master Admin Console */
export default function LegacyAdminRedirectPage() {
  redirect("/admin/dashboard");
}
