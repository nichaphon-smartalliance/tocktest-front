import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SandboxContent from "@/components/partials/Sandbox/SandboxContent";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function SandboxPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { repoId } = await params;
  return <SandboxContent repoId={repoId} />;
}
