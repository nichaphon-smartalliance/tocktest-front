import { SettingsContent } from "@/components/partials/Settings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <SettingsContent repoId={repoId} />;
}
