import { TestCasesContent } from "@/components/partials/TestCases";

export default async function TestCasesPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <TestCasesContent repoId={repoId} />;
}
