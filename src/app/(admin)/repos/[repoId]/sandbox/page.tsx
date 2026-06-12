import { ClientOnly } from "@/components/ui/ClientOnly";
import SandboxContent from "@/components/partials/Sandbox/SandboxContent";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function SandboxPage({ params }: Props) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <SandboxContent repoId={repoId} />
    </ClientOnly>
  );
}
