import { DocsContent } from "@/components/partials/Docs";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <DocsContent repoId={repoId} />;
}
