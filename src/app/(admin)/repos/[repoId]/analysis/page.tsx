import { AnalysisContent } from "@/components/partials/Analysis";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <AnalysisContent repoId={repoId} />;
}
