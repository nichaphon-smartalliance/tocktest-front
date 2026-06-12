import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatContent from "@/components/partials/Chat/ChatContent";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { repoId } = await params;
  return <ChatContent repoId={repoId} />;
}
