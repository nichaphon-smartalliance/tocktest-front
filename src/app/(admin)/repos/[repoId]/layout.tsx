import { RepoLayoutContent } from "@/components/partials/RepoLayout";

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <RepoLayoutContent repoId={repoId}>{children}</RepoLayoutContent>;
}
