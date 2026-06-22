"use client";

import { useState } from "react";
import {
  Button,
  Table,
  Chip,
  TextField,
  Label,
  InputGroup,
  Spinner,
  Modal,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { message } from "@/lib/toast";
import { Trash2, CheckCircle, Github, Link2 } from "lucide-react";
import { useGithubTokens } from "@/hooks/repository";
import type { GithubToken } from "@/types/app/repository";
import dayjs from "dayjs";
import { ControlledModal } from "@/components/ui/ControlledModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface AddTokenModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTokenModal({ open, onClose }: AddTokenModalProps) {
  const t = useTranslations("tokenModal");
  const [tab, setTab] = useState<"list" | "add">("list");
  const [label, setLabel] = useState("");
  const [token, setToken] = useState("");
  const { tokens, isLoading, createToken, isCreating, deleteToken, connectGithub } = useGithubTokens();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !token.trim()) return;
    try {
      await createToken({ label: label.trim(), token: token.trim() });
      message.success(t("addSuccess"));
      setLabel("");
      setToken("");
      setTab("list");
    } catch {
      message.error(t("addError"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteToken(id);
      message.success(t("deleteSuccess"));
    } catch {
      message.error(t("deleteError"));
    }
  };

  return (
    <ControlledModal open={open} onClose={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("heading")}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body>
              <div className="flex gap-2 mb-4">
                <Button variant={tab === "list" ? "primary" : "secondary"} size="sm" onPress={() => setTab("list")}>
                  {t("tabList")}
                </Button>
                <Button variant={tab === "add" ? "primary" : "secondary"} size="sm" onPress={() => setTab("add")}>
                  {t("tabAdd")}
                </Button>
              </div>

              {!tokens.some((t) => t.provider === "oauth") && (
                <div className="mb-4 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-3 dark:border-sky-800 dark:bg-sky-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <Github size={16} className="mt-0.5 text-sky-600" />
                      <div>
                        <p className="m-0 text-sm font-semibold">{t("connectTitle")}</p>
                        <p className="m-0 text-xs text-muted">
                          {t("connectDesc")}
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onPress={() => void connectGithub()}>
                      <Link2 size={14} />
                      {t("connectBtn")}
                    </Button>
                  </div>
                </div>
              )}

              {tab === "list" ? (
                isLoading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : tokens.length === 0 ? (
                  <p className="text-center text-muted py-8 text-sm">{t("noTokens")}</p>
                ) : (
                  <Table>
                    <Table.ScrollContainer>
                      <Table.Content aria-label="GitHub tokens">
                        <Table.Header>
                          <Table.Column isRowHeader>{t("colName")}</Table.Column>
                          <Table.Column>{t("colStatus")}</Table.Column>
                          <Table.Column>{t("colDate")}</Table.Column>
                          <Table.Column className="w-12" />
                        </Table.Header>
                        <Table.Body>
                          {tokens.map((record: GithubToken) => (
                            <Table.Row key={record.id} id={record.id}>
                              <Table.Cell><span className="font-semibold">{record.label}</span></Table.Cell>
                              <Table.Cell>
                                <Chip size="sm" variant="soft" color={record.isActive ? "success" : "danger"}>
                                  <Chip.Label className="flex items-center gap-1">
                                    <CheckCircle size={10} />
                                    {record.isActive ? t("active") : t("inactive")}
                                  </Chip.Label>
                                </Chip>
                              </Table.Cell>
                              <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                              <Table.Cell>
                                <ConfirmDialog
                                  title={t("deleteConfirm")}
                                  confirmLabel={t("delete")}
                                  confirmVariant="danger"
                                  onConfirm={() => handleDelete(record.id)}
                                  trigger={
                                    <Button variant="ghost" isIconOnly size="sm" aria-label={t("deleteAria")}>
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
                )
              ) : (
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                  <TextField value={label} onChange={setLabel} isRequired>
                    <Label>{t("labelField")}</Label>
                    <InputGroup><InputGroup.Input placeholder={t("labelPlaceholder")} /></InputGroup>
                  </TextField>
                  <TextField value={token} onChange={setToken} isRequired>
                    <Label>{t("patField")}</Label>
                    <InputGroup><InputGroup.Input type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" /></InputGroup>
                    <p className="text-xs text-muted mt-1">{t("patHint")}</p>
                  </TextField>
                  <Button type="submit" variant="primary" fullWidth isDisabled={isCreating}>
                    {isCreating ? t("saving") : t("save")}
                  </Button>
                </form>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </ControlledModal>
  );
}

