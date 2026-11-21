import { redirect } from "next/navigation";

/** Alias for public booking storefront. */
export default function StoresAliasPage({
  params,
}: {
  params: { store_slug: string };
}) {
  redirect(`/booking/${params.store_slug}`);
}
