import dynamic from "next/dynamic";

const SettingsContent = dynamic(
  () => import("@/components/partials/Settings/SettingsContent"),
  { ssr: false },
);

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <SettingsContent repoId={repoId} />;
}
