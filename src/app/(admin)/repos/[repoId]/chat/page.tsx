import { ClientOnly } from "@/components/ui/ClientOnly";
import ChatContent from "@/components/partials/Chat/ChatContent";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <ChatContent repoId={repoId} />
    </ClientOnly>
  );
}
