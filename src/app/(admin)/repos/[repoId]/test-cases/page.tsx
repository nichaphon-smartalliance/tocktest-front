import { ClientOnly } from "@/components/ui/ClientOnly";
import TestCasesContent from "@/components/partials/TestCases/TestCasesContent";

export default async function TestCasesPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <TestCasesContent repoId={repoId} />
    </ClientOnly>
  );
}
