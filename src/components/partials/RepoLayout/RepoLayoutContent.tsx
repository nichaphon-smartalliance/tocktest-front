"use client";

import { Tabs, Skeleton, Breadcrumb, Tag } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { LockOutlined, GlobalOutlined } from "@ant-design/icons";
import { BugPlay, GitCommitHorizontal, BookOpen, Settings } from "lucide-react";
import { useRepository } from "@/hooks/repository";

interface RepoLayoutContentProps {
  repoId: string;
  children: React.ReactNode;
}

const TAB_ITEMS = [
  { key: "test-cases", label: "Test Cases", icon: <BugPlay size={14} /> },
  { key: "analysis", label: "Analysis", icon: <GitCommitHorizontal size={14} /> },
  { key: "docs", label: "Docs", icon: <BookOpen size={14} /> },
  { key: "settings", label: "Settings", icon: <Settings size={14} /> },
];

export default function RepoLayoutContent({ repoId, children }: RepoLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { repository, isLoading } = useRepository(repoId);

  const activeTab = TAB_ITEMS.find((t) => pathname.endsWith(t.key))?.key ?? "test-cases";

  const onTabChange = (key: string) => {
    router.push(`/repos/${repoId}/${key}`);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          { title: <span onClick={() => router.push("/dashboard")} style={{ cursor: "pointer" }}>แดชบอร์ด</span> },
          {
            title: isLoading ? (
              <Skeleton.Input active size="small" style={{ width: 120 }} />
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {repository?.fullName}
                {repository && (
                  <Tag
                    icon={repository.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
                    color={repository.isPrivate ? "default" : "green"}
                    style={{ marginLeft: 4, fontSize: 11 }}
                  >
                    {repository.isPrivate ? "Private" : "Public"}
                  </Tag>
                )}
              </span>
            ),
          },
        ]}
      />

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        style={{ marginBottom: 0 }}
        items={TAB_ITEMS.map((t) => ({
          key: t.key,
          label: (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {t.icon}
              {t.label}
            </span>
          ),
        }))}
      />

      <div style={{ paddingTop: 16 }}>{children}</div>
    </div>
  );
}
