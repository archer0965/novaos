import { NovaShieldAdminClient } from "@/components/master-admin/novashield-admin-client";
import { ProductPanelHeader } from "@/components/master-admin/product-panel";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";

export default function AdminNovaShieldPage() {
  const product = ADMIN_PRODUCTS.find((p) => p.id === "novashield")!;

  return (
    <div className="space-y-6">
      <ProductPanelHeader
        product={product}
        title="Nova商譽寶 總管理後台"
        subtitle="管理全部門市、檢視 PRO 訂閱與到期狀態、人工開通／展延，並查詢綠界付款紀錄"
      />
      <NovaShieldAdminClient />
    </div>
  );
}
