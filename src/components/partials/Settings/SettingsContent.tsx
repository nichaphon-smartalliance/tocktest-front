"use client";

import { Button, Card, Chip, InputGroup, Label, Spinner, Switch, Table, TextField } from "@heroui/react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  const [defaultBranch, setDefaultBranch] = useState("");
  const [autoAnalyzeOnPush, setAutoAnalyzeOnPush] = useState(false);
 
  const [docsAutoSync, setDocsAutoSync] = useState(false);
  const locale = useLocale();
  const t = useTranslations("repoSettings");
  const { tokens, isLoading: isLoadingTokens, deleteToken } = useGithubTokens();
  const { settings, isLoading, update, isUpdating } = useRepoSettings(repoId);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  useEffect(() => {
    if (!settings) return;
    setDefaultBranch(settings.defaultBranch ?? "");
    setAutoAnalyzeOnPush(settings.autoAnalyzeOnPush ?? false);
    
    setDocsAutoSync(settings.docsAutoSync ?? false);
  }, [settings]);

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteToken(id);
      message.success(t("tokenRemoved"));
    } catch {
      message.error(t("tokenRemoveFail"));
    }
  };

  const handleSave = async () => {
    try {
      await update({ defaultBranch, autoAnalyzeOnPush, docsAutoSync });
      message.success(t("saved"));
    } catch {
      message.error(t("saveFail"));
    }
  };


  return (
    <div className="max-w-[760px]">
      <Card className="mb-4 rounded-lg">
        <Card.Header className="flex items-center justify-between px-4 py-3 gap-5">
          <Card.Title className="text-base font-semibold m-0">{t("githubTokens")}</Card.Title>
          <Button size="sm" variant="secondary" onPress={() => setAddTokenOpen(true)}>
            <Plus size={14} />
            {t("addToken")}
          </Button>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoadingTokens ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tokens.length === 0 ? (
            <p className="text-center text-muted py-8 text-sm">{t("noToken")}</p>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="GitHub tokens">
                  <Table.Header>
                    <Table.Column isRowHeader>{t("colLabel")}</Table.Column>
                    <Table.Column>{t("colStatus")}</Table.Column>
                    <Table.Column>{t("colCreated")}</Table.Column>
                    <Table.Column>{t("colExpires")}</Table.Column>
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
                            <Chip.Label>{record.isActive ? t("active") : t("inactive")}</Chip.Label>
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                        <Table.Cell>
                          {!record.expiresAt ? (
                            <span className="text-muted">{t("noExpiry")}</span>
                          ) : (
                            <Chip
                              size="sm"
                              variant="soft"
                              color={dayjs(record.expiresAt).isBefore(dayjs()) ? "danger" : "accent"}
                            >
                              <Chip.Label>
                                {dayjs(record.expiresAt).format("DD/MM/YYYY")}
                                {dayjs(record.expiresAt).isBefore(dayjs()) ? t("expiredSuffix") : ""}
                              </Chip.Label>
                            </Chip>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <ConfirmDialog
                            title={t("removeConfirm")}
                            confirmLabel={t("remove")}
                            confirmVariant="danger"
                            onConfirm={() => handleDeleteToken(record.id)}
                            trigger={
                              <Button variant="ghost" isIconOnly size="sm" aria-label={t("removeAria")}>
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
          <Card.Title className="text-base font-semibold m-0">{t("title")}</Card.Title>
        </Card.Header>
        <Card.Content className="px-4 pb-4 flex flex-col gap-4">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <TextField value={defaultBranch} onChange={setDefaultBranch}>
                <Label>{t("defaultBranch")}</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="main" />
                </InputGroup>
              </TextField>

              <Switch isSelected={autoAnalyzeOnPush} onChange={setAutoAnalyzeOnPush}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  {t("autoAnalyze")}
                  <span className="block text-xs text-muted mt-1">{t("autoAnalyzeDesc")}</span>
                </Switch.Content>
              </Switch>

              <Switch isSelected={docsAutoSync} onChange={setDocsAutoSync}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  {t("docsAutoSync")}
                  <span className="block text-xs text-muted mt-1">{t("docsAutoSyncDesc")}</span>
                </Switch.Content>
              </Switch>

              <div className="pt-1">
                <Button variant="primary" isDisabled={isUpdating} onPress={() => void handleSave()}>
                  {t("save")}
                </Button>
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      <AddTokenModal open={addTokenOpen} onClose={() => setAddTokenOpen(false)} />
    </div>
  );
}
