import { notFound } from "next/navigation";

export const metadata = { title: "頁面不存在" };

export default function AiDocPage(): never {
  notFound();
}
