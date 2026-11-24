import { MasterAdminShell } from "@/components/master-admin/shell";
import { requireAdminPage } from "@/lib/master-admin/auth";

export const metadata = {
  title: "總管理後台｜拓新雲端 NovaOS",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();
  return (
    <MasterAdminShell email={session.email}>{children}</MasterAdminShell>
  );
}
