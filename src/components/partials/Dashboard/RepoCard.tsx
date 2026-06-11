"use client";

import { Card, Chip, Tooltip } from "@heroui/react";
import { Lock, Globe, Package, GitBranch, Clock } from "lucide-react";
import Link from "next/link";
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
  return (
    <Link href={`/repos/${repo.id}/test-cases`} className="block h-full">
    <Card
      className="h-full rounded-xl cursor-pointer hover:shadow-md transition-shadow"
    >
      <Card.Content className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Package size={20} className="text-indigo-500 shrink-0" />
            <Tooltip>
              <Tooltip.Trigger>
                <span className="font-semibold text-sm truncate max-w-[140px] block">
                  {repo.name}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>{repo.fullName}</Tooltip.Content>
            </Tooltip>
          </div>
          <Chip
            size="sm"
            variant="soft"
            color={repo.isPrivate ? undefined : "success"}
          >
            <Chip.Label className="flex items-center gap-1">
              {repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
              {repo.isPrivate ? "Private" : "Public"}
            </Chip.Label>
          </Chip>
        </div>

        <p className="text-xs text-muted mb-3 min-h-[36px] line-clamp-2">
          {repo.description || "ไม่มีคำอธิบาย"}
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <GitBranch size={12} />
            <span>{repo.defaultBranch}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock size={12} />
            <span>
              {repo.lastSyncedAt
                ? `ซิงค์ ${dayjs(repo.lastSyncedAt).fromNow()}`
                : "ยังไม่ได้ซิงค์"}
            </span>
          </div>
        </div>
      </Card.Content>
    </Card>
    </Link>
  );
}
