"use client";

import { Card, Tag, Tooltip } from "antd";
import { LockOutlined, GlobalOutlined } from "@ant-design/icons";
import { GitBranch, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { Repository } from "@/types/app/repository";

dayjs.extend(relativeTime);
dayjs.locale("th");

interface RepoCardProps {
  repo: Repository;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const router = useRouter();

  return (
    <Card
      hoverable
      onClick={() => router.push(`/repos/${repo.id}/test-cases`)}
      style={{ borderRadius: 12, height: "100%" }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📦</span>
          <Tooltip title={repo.fullName}>
            <span style={{ fontWeight: 600, fontSize: 14, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {repo.name}
            </span>
          </Tooltip>
        </div>
        <Tag
          icon={repo.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
          color={repo.isPrivate ? "default" : "green"}
          style={{ borderRadius: 6, fontSize: 11 }}
        >
          {repo.isPrivate ? "Private" : "Public"}
        </Tag>
      </div>

      <p style={{ margin: "0 0 12px", opacity: 0.5, fontSize: 12, minHeight: 36, lineHeight: "18px" }}>
        {repo.description || "ไม่มีคำอธิบาย"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: 0.6 }}>
          <GitBranch size={12} />
          <span>{repo.defaultBranch}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: 0.6 }}>
          <Clock size={12} />
          <span>
            {repo.lastSyncedAt
              ? `ซิงค์ ${dayjs(repo.lastSyncedAt).fromNow()}`
              : "ยังไม่ได้ซิงค์"}
          </span>
        </div>
      </div>
    </Card>
  );
}
