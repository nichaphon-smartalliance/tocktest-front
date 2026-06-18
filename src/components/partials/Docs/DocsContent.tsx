"use client";

import { Alert, Button, Chip, Spinner, Switch, TextArea } from "@heroui/react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Code2, FileText, History, Pencil, RefreshCw, Save, Sparkles, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { useProjectDoc } from "@/hooks/docs";
import { useRepoSettings } from "@/hooks/settings";
import { getApiErrorMessage } from "@/lib/api-error";
import { message } from "@/lib/toast";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

interface DocsContentProps {
  repoId: string;
}

export default function DocsContent({ repoId }: DocsContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const lastSyncedAtRef = useRef<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("docs");
  const t2 = useTranslations("testCases.folder");

  const {
    doc,
    status,
    isLoading,
    versions,
    update,
    isUpdating,
    generate,
    isGenerating,
    refresh,
    isRefreshing,
    autoUpdate,
    isAutoUpdating,
    deleteDoc,
    isDeleting,
  } = useProjectDoc(repoId);
  const { settings, update: updateSettings, isUpdating: isUpdatingSettings } = useRepoSettings(repoId);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  useEffect(() => {
    if (!status || !settings?.docsAutoSync || !status.isStale) return;
    if (status.status === "queued" || status.status === "running") return;
    void refresh().catch(() => undefined);
  }, [refresh, settings?.docsAutoSync, status]);

  useEffect(() => {
    if (!status?.lastGeneratedAt) return;
    if (status.lastGeneratedAt === lastSyncedAtRef.current) return;
    lastSyncedAtRef.current = status.lastGeneratedAt;
    if (status.status === "success") {
      message.success(status.message ?? t("toastUpdated"));
    }
  }, [status, t]);

  const statusTone = useMemo(() => {
    switch (status?.status) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "queued":
      case "running":
        return "warning";
      default:
        return "accent";
    }
  }, [status?.status]);

  const handleSave = async () => {
    try {
      await update(editContent);
      message.success(t("toastSaved"));
      setIsEditing(false);
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastSaveFail")));
    }
  };

  const handleGenerate = async () => {
    try {
      await generate();
      message.success(t("toastBuildQueued"));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastBuildFail")));
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      message.success(t("toastRefreshQueued"));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastRefreshFail")));
    }
  };

  const handleAutoUpdate = async () => {
    try {
      await autoUpdate();
      message.success(t("toastAutoQueued"));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastAutoFail")));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc();
      message.success(t("toastRemoved"));
      setIsEditing(false);
      setShowHistory(false);
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastDeleteFail")));
    }
  };

  const handleToggleAutoSync = async (selected: boolean) => {
    try {
      await updateSettings({ docsAutoSync: selected });
      message.success(selected ? t("toastAutoSyncOn") : t("toastAutoSyncOff"));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastAutoSyncFail")));
    }
  };

  const handleToggleOffline = async (selected: boolean) => {
    try {
      await updateSettings({ aiOfflineMode: selected });
      message.success(selected ? t("toastOfflineOn") : t("toastOfflineOff"));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastOfflineFail")));
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {doc && (
            <Chip size="sm" variant="soft">
              <Chip.Label>v{doc.version}</Chip.Label>
            </Chip>
          )}
          {status && (
            <Chip size="sm" variant="soft" color={statusTone}>
              <Chip.Label>{status.status}</Chip.Label>
            </Chip>
          )}
          <span className="text-xs text-muted">
            {status?.lastGeneratedAt
              ? t("lastGenerated", { date: dayjs(status.lastGeneratedAt).format("DD MMM YYYY HH:mm") })
              : doc
                ? t("updated", { date: dayjs(doc.updatedAt).format("DD MMM YYYY HH:mm") })
                : ""}
          </span>
          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" isDisabled={isGenerating || isEditing} onPress={() => void handleGenerate()}>
              <Sparkles size={14} />
              {t("buildDocs")}
            </Button>
            <Button variant="secondary" size="sm" isDisabled={isRefreshing || isEditing} onPress={() => void handleRefresh()}>
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              {t("refresh")}
            </Button>
            <Button variant="secondary" size="sm" isDisabled={isAutoUpdating || isEditing} onPress={() => void handleAutoUpdate()}>
              <Bot size={14} />
              {t("autoUpdate")}
            </Button>
            <Button variant="secondary" size="sm" onPress={() => setShowHistory((value) => !value)}>
              <History size={14} />
              {t("history")}
            </Button>
            {!isEditing ? (
              <Button variant="primary" size="sm" onPress={() => {
                setEditContent(doc?.content ?? "");
                setIsEditing(true);
              }}>
                <Pencil size={14} />
                {doc ? t("edit") : t2("createBtn")}
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="sm" onPress={() => setIsEditing(false)}>
                  <X size={14} />
                  {t("cancel")}
                </Button>
                <Button variant="primary" size="sm" isDisabled={isUpdating} onPress={() => void handleSave()}>
                  <Save size={14} />
                  {isUpdating ? "Saving..." : t("save")}
                </Button>
              </>
            )}
            {doc && (
              <ConfirmDialog
                title={t("deleteTitle")}
                description={t("deleteDesc")}
                confirmLabel={t("deleteConfirm")}
                confirmVariant="danger"
                onConfirm={handleDelete}
                trigger={
                  <Button variant="danger" size="sm" isDisabled={isDeleting}>
                    <Trash2 size={14} />
                    {t("delete")}
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="grid gap-3 mb-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <Switch
              isSelected={settings?.docsAutoSync ?? false}
              isDisabled={isUpdatingSettings}
              onChange={handleToggleAutoSync}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                {t("docsAutoSync")}
                <span className="block text-xs text-muted mt-1">{t("docsAutoSyncDesc")}</span>
              </Switch.Content>
            </Switch>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <Switch
              isSelected={settings?.aiOfflineMode ?? false}
              isDisabled={isUpdatingSettings}
              onChange={handleToggleOffline}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                {t("aiOffline")}
                <span className="block text-xs text-muted mt-1">{t("aiOfflineDesc")}</span>
              </Switch.Content>
            </Switch>
          </div>
        </div>

        {status && (
          <Alert status={statusTone} className="mb-4">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{t("pipelineTitle")}</Alert.Title>
              <Alert.Description>
                <p className="text-sm">{status.message ?? t("ready")}</p>
                <p className="text-xs text-muted mt-1">
                  {status.isStale ? t("stale") : t("upToDate")}
                </p>
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : isEditing ? (
          <div className="flex flex-col gap-3">
            <TiptapEditor
              value={editContent}
              onChange={setEditContent}
              placeholder={t("richEditorPlaceholder")}
            />
            <div>
              <Button variant="secondary" size="sm" onPress={() => setShowSource((value) => !value)}>
                <Code2 size={14} />
                {showSource ? t("hideSource") : t("showSource")}
              </Button>
              {showSource && (
                <TextArea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="mt-2 min-h-[300px] min-w-[100%] font-mono text-sm"
                  placeholder={t("editorPlaceholder")}
                />
              )}
            </div>
          </div>
        ) : !doc ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={48} className="opacity-20 mb-4" />
            <p className="text-muted">{t("empty")}</p>
          </div>
        ) : (
          <div className="markdown-body p-6 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[400px] text-sm leading-relaxed bg-white dark:bg-gray-900">
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className } = props;
                  return (
                    <code className={className ? className : "rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5"}>
                      {children}
                    </code>
                  );
                },
                pre(props) {
                  return (
                    <pre className="overflow-x-auto rounded-lg bg-gray-950 text-gray-100 p-4 text-xs leading-6">
                      {props.children}
                    </pre>
                  );
                },
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {showHistory && (
        <div className="w-64 shrink-0">
          <div className="font-semibold mb-3 text-sm">{t("versionHistory")}</div>
          <div className="flex flex-col gap-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {versions.map((version) => (
              <div
                key={version.version}
                className={`relative ${version.version === doc?.version ? "text-indigo-600 dark:text-indigo-400" : "text-muted"}`}
              >
                <div
                  className={`absolute -left-[21px] top-1.5 size-2.5 rounded-full ${
                    version.version === doc?.version ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                <div className="font-medium text-sm">v{version.version}</div>
                <div className="text-xs opacity-70">{dayjs(version.updatedAt).format("DD/MM/YYYY HH:mm")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
