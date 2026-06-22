import { ClientOnly } from "@/components/ui/ClientOnly";
import SettingsContent from "@/components/partials/Settings/SettingsContent";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return (
    <ClientOnly>
      <SettingsContent repoId={repoId} />
    </ClientOnly>
  );
}
