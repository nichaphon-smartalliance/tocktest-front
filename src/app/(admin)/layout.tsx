import { redirect } from "next/navigation";
import { AdminLayoutShell } from "@/components/layout/AdminLayout";
import { getSafeSession } from "@/lib/get-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSafeSession();
  if (!session) redirect("/login");

  return <AdminLayoutShell session={session}>{children}</AdminLayoutShell>;
}
