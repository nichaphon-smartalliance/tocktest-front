import dynamic from "next/dynamic";

const AnalysisContent = dynamic(
  () => import("@/components/partials/Analysis/AnalysisContent"),
  { ssr: false },
);

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <AnalysisContent repoId={repoId} />;
}
