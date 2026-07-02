import { ClientOnly } from "@/components/ui/ClientOnly";
import ChatWorkspace from "@/components/partials/Chat/ChatWorkspace";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <ChatWorkspace repoId={repoId} />
    </ClientOnly>
  );
}
