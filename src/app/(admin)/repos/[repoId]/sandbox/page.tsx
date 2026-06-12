import dynamic from "next/dynamic";

const SandboxContent = dynamic(
  () => import("@/components/partials/Sandbox/SandboxContent"),
  { ssr: false },
);

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function SandboxPage({ params }: Props) {
  const { repoId } = await params;
  return <SandboxContent repoId={repoId} />;
}
