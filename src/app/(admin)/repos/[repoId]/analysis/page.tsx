import { ClientOnly } from "@/components/ui/ClientOnly";
import AnalysisContent from "@/components/partials/Analysis/AnalysisContent";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <AnalysisContent repoId={repoId} />
    </ClientOnly>
  );
}
