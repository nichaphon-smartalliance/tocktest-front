import dynamic from "next/dynamic";

const ChatContent = dynamic(
  () => import("@/components/partials/Chat/ChatContent"),
  { ssr: false },
);

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { repoId } = await params;
  return <ChatContent repoId={repoId} />;
}
