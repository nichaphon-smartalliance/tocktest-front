"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Chip,
  TextField,
  Label,
  InputGroup,
  Switch,
  Spinner,
} from "@heroui/react";
import { message } from "@/lib/toast";
import { Trash2, Plus } from "lucide-react";
import { useGithubTokens } from "@/hooks/repository";
import { useRepoSettings } from "@/hooks/settings";
import type { GithubToken } from "@/types/app/repository";
import { AddTokenModal } from "@/components/partials/Dashboard/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import dayjs from "dayjs";

interface SettingsContentProps {
  repoId: string;
}

export default function SettingsContent({ repoId }: SettingsContentProps) {
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const { tokens, isLoading: isLoadingTokens, deleteToken } = useGithubTokens();
  const { settings, isLoading, update, isUpdating } = useRepoSettings(repoId);

  const [defaultBranch, setDefaultBranch] = useState("");
  const [autoAnalyzeOnPush, setAutoAnalyzeOnPush] = useState(false);

  useEffect(() => {
    if (settings) {
      setDefaultBranch(settings.defaultBranch ?? "");
      setAutoAnalyzeOnPush(settings.autoAnalyzeOnPush ?? false);
    }
  }, [settings]);

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteToken(id);
      message.success("ลบ Token สำเร็จ");
    } catch {
      message.error("ลบ Token ไม่สำเร็จ");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await update({ defaultBranch, autoAnalyzeOnPush });
      message.success("บันทึกการตั้งค่าสำเร็จ");
    } catch {
      message.error("บันทึกไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-[700px]">
      <Card className="mb-4 rounded-lg">
        <Card.Header className="flex items-center justify-between px-4 py-3">
          <Card.Title className="text-base font-semibold m-0">GitHub Tokens</Card.Title>
          <Button size="sm" variant="secondary" onPress={() => setAddTokenOpen(true)}>
            <Plus size={14} />
            เพิ่ม Token
          </Button>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoadingTokens ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tokens.length === 0 ? (
            <p className="text-center text-muted py-8 text-sm">ยังไม่มี GitHub Token</p>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="GitHub tokens">
                  <Table.Header>
                    <Table.Column isRowHeader>ชื่อ</Table.Column>
                    <Table.Column>สถานะ</Table.Column>
                    <Table.Column>เพิ่มเมื่อ</Table.Column>
                    <Table.Column>วันหมดอายุ</Table.Column>
                    <Table.Column className="w-12" />
                  </Table.Header>
                  <Table.Body>
                    {tokens.map((record: GithubToken) => (
                      <Table.Row key={record.id} id={record.id}>
                        <Table.Cell>
                          <span className="font-semibold">{record.label}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={record.isActive ? "success" : "danger"}
                          >
                            <Chip.Label>{record.isActive ? "ใช้งานได้" : "ไม่ได้ใช้งาน"}</Chip.Label>
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                        <Table.Cell>
                          {!record.expiresAt ? (
                            <span className="text-muted">ไม่มีกำหนด</span>
                          ) : (
                            <Chip
                              size="sm"
                              variant="soft"
                              color={dayjs(record.expiresAt).isBefore(dayjs()) ? "danger" : "accent"}
                            >
                              <Chip.Label>
                                {dayjs(record.expiresAt).format("DD/MM/YYYY")}
                                {dayjs(record.expiresAt).isBefore(dayjs()) && " (หมดอายุแล้ว)"}
                              </Chip.Label>
                            </Chip>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <ConfirmDialog
                            title="ลบ Token นี้?"
                            confirmLabel="ลบ"
                            confirmVariant="danger"
                            onConfirm={() => handleDeleteToken(record.id)}
                            trigger={
                              <Button variant="ghost" isIconOnly size="sm" aria-label="ลบ Token">
                                <Trash2 size={14} className="text-red-500" />
                              </Button>
                            }
                          />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          )}
        </Card.Content>
      </Card>

      <Card className="rounded-lg">
        <Card.Header className="px-4 py-3">
          <Card.Title className="text-base font-semibold m-0">ตั้งค่า Repository</Card.Title>
        </Card.Header>
        <Card.Content className="px-4 pb-4 flex flex-col gap-4">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <TextField value={defaultBranch} onChange={setDefaultBranch}>
                <Label>Default Branch</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="main" />
                </InputGroup>
              </TextField>

              <Switch
                isSelected={autoAnalyzeOnPush}
                onChange={(selected) => setAutoAnalyzeOnPush(selected)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>วิเคราะห์ commit อัตโนมัติเมื่อมี push</Switch.Content>
              </Switch>

              <Button variant="primary" isDisabled={isUpdating} onPress={handleSaveSettings}>
                {isUpdating ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <AddTokenModal open={addTokenOpen} onClose={() => setAddTokenOpen(false)} />
    </div>
  );
}
