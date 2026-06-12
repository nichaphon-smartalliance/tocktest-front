import dynamic from "next/dynamic";

const DocsContent = dynamic(
  () => import("@/components/partials/Docs/DocsContent"),
  { ssr: false },
);

export default async function DocsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <DocsContent repoId={repoId} />;
}
