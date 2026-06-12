import dynamic from "next/dynamic";

const TestCasesContent = dynamic(
  () => import("@/components/partials/TestCases/TestCasesContent"),
  { ssr: false },
);

export default async function TestCasesPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <TestCasesContent repoId={repoId} />;
}
