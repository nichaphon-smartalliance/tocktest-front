import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/layout/AdminLayout";
import { toClientSession } from "@/types/app/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <AdminLayoutShell session={toClientSession(session)}>{children}</AdminLayoutShell>;
}
