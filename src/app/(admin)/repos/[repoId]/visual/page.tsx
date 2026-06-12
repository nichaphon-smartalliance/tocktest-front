import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import VisualContent from "@/components/partials/Visual/VisualContent";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function VisualPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { repoId } = await params;
  return <VisualContent repoId={repoId} />;
}
