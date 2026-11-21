import { notFound } from "next/navigation";
import { BookingPublicForm } from "@/components/booking/booking-public-form";
import { PAYMENT_GATEWAY_STATUS } from "@/lib/novaos";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({
  params,
}: {
  params: { store_slug: string };
}) {
  const admin = createAdminClient();
  const slug = decodeURIComponent(params.store_slug);

  let { data: seller } = await admin
    .from("profiles")
    .select("id, shop_name, shop_slug, shop_bio")
    .eq("shop_slug", slug)
    .maybeSingle();

  if (!seller) {
    const byId = await admin
      .from("profiles")
      .select("id, shop_name, shop_slug, shop_bio")
      .eq("id", slug)
      .maybeSingle();
    seller = byId.data;
  }

  if (!seller) notFound();

  const { data: services } = await admin
    .from("booking_services")
    .select(
      "id, title, duration_minutes, price, offpeak_discount_pct, buffer_minutes"
    )
    .eq("seller_id", seller.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <div className="rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700/80">
          拓脈預約 · Nova Booking
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold">
          {seller.shop_name || "美業工作室"}
        </h1>
        {seller.shop_bio ? (
          <p className="mt-2 text-sm text-muted-foreground">{seller.shop_bio}</p>
        ) : null}
        <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900">
          現場服務結算依店家公告；訂閱升級採 {PAYMENT_GATEWAY_STATUS.activeLabel}
        </p>
      </div>

      <div className="mt-6">
        <BookingPublicForm
          sellerId={seller.id}
          services={services || []}
        />
      </div>
    </div>
  );
}
