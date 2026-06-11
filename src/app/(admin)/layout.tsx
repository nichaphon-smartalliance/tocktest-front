import { redirect } from "next/navigation";
import { AdminLayoutShell } from "@/components/layout/AdminLayout";
import { toClientSession } from "@/types/app/session";
import { getSafeSession } from "@/lib/get-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  return <AdminLayoutShell session={toClientSession(session)}>{children}</AdminLayoutShell>;
}
