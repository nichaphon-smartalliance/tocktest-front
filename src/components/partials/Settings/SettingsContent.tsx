"use client";

import { useEffect, useState } from "react";
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
import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import { AddTokenModal } from "@/components/partials/Dashboard/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useGithubTokens } from "@/hooks/repository";
import { useRepoSettings } from "@/hooks/settings";
import { message } from "@/lib/toast";
import type { GithubToken } from "@/types/app/repository";

interface SettingsContentProps {
  repoId: string;
}

export default function SettingsContent({ repoId }: SettingsContentProps) {
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const { tokens, isLoading: isLoadingTokens, deleteToken } = useGithubTokens();
  const { settings, isLoading, update, isUpdating } = useRepoSettings(repoId);

  const [defaultBranch, setDefaultBranch] = useState("");
  const [autoAnalyzeOnPush, setAutoAnalyzeOnPush] = useState(false);
  const [aiOfflineMode, setAiOfflineMode] = useState(false);
  const [docsAutoSync, setDocsAutoSync] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setDefaultBranch(settings.defaultBranch ?? "");
    setAutoAnalyzeOnPush(settings.autoAnalyzeOnPush ?? false);
    setAiOfflineMode(settings.aiOfflineMode ?? false);
    setDocsAutoSync(settings.docsAutoSync ?? false);
  }, [settings]);

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteToken(id);
      message.success("Token removed");
    } catch {
      message.error("Failed to remove token");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await update({ defaultBranch, autoAnalyzeOnPush, aiOfflineMode, docsAutoSync });
      message.success("Repository settings saved");
    } catch {
      message.error("Failed to save repository settings");
    }
  };

  return (
    <div className="max-w-[760px]">
      <Card className="mb-4 rounded-lg">
        <Card.Header className="flex items-center justify-between px-4 py-3">
          <Card.Title className="text-base font-semibold m-0">GitHub Tokens</Card.Title>
          <Button size="sm" variant="secondary" onPress={() => setAddTokenOpen(true)}>
            <Plus size={14} />
            Add token
          </Button>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoadingTokens ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tokens.length === 0 ? (
            <p className="text-center text-muted py-8 text-sm">No GitHub token connected yet.</p>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="GitHub tokens">
                  <Table.Header>
                    <Table.Column isRowHeader>Label</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column>Created</Table.Column>
                    <Table.Column>Expires</Table.Column>
                    <Table.Column className="w-12" />
                  </Table.Header>
                  <Table.Body>
                    {tokens.map((record: GithubToken) => (
                      <Table.Row key={record.id} id={record.id}>
                        <Table.Cell>
                          <span className="font-semibold">{record.label}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <Chip size="sm" variant="soft" color={record.isActive ? "success" : "danger"}>
                            <Chip.Label>{record.isActive ? "Active" : "Inactive"}</Chip.Label>
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                        <Table.Cell>
                          {!record.expiresAt ? (
                            <span className="text-muted">No expiry</span>
                          ) : (
                            <Chip
                              size="sm"
                              variant="soft"
                              color={dayjs(record.expiresAt).isBefore(dayjs()) ? "danger" : "accent"}
                            >
                              <Chip.Label>
                                {dayjs(record.expiresAt).format("DD/MM/YYYY")}
                                {dayjs(record.expiresAt).isBefore(dayjs()) ? " (expired)" : ""}
                              </Chip.Label>
                            </Chip>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <ConfirmDialog
                            title="Remove this token?"
                            confirmLabel="Remove"
                            confirmVariant="danger"
                            onConfirm={() => handleDeleteToken(record.id)}
                            trigger={
                              <Button variant="ghost" isIconOnly size="sm" aria-label="Remove token">
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
          <Card.Title className="text-base font-semibold m-0">Repository Settings</Card.Title>
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

              <Switch isSelected={autoAnalyzeOnPush} onChange={setAutoAnalyzeOnPush}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  Auto analyze on push
                  <span className="block text-xs text-muted mt-1">
                    Queue commit analysis when new pushes arrive for this repository.
                  </span>
                </Switch.Content>
              </Switch>

              <Switch isSelected={aiOfflineMode} onChange={setAiOfflineMode}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  AI Offline Mode
                  <span className="block text-xs text-muted mt-1">
                    Block AI requests in the UI and force backend workflows to short-circuit safely.
                  </span>
                </Switch.Content>
              </Switch>

              <Switch isSelected={docsAutoSync} onChange={setDocsAutoSync}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  Docs Auto Sync
                  <span className="block text-xs text-muted mt-1">
                    Keep project docs refreshed when source files change without starting duplicate jobs.
                  </span>
                </Switch.Content>
              </Switch>

              <Button variant="primary" isDisabled={isUpdating} onPress={handleSaveSettings}>
                {isUpdating ? "Saving..." : "Save settings"}
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <AddTokenModal open={addTokenOpen} onClose={() => setAddTokenOpen(false)} />
    </div>
  );
}
