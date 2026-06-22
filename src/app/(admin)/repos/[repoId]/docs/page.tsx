import { ClientOnly } from "@/components/ui/ClientOnly";
import DocsContent from "@/components/partials/Docs/DocsContent";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <DocsContent repoId={repoId} />
    </ClientOnly>
  );
}
