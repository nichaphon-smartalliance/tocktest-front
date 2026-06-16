"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Chip, Spinner, Switch, TextArea } from "@heroui/react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  Bot,
  FileText,
  History,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useProjectDoc } from "@/hooks/docs";
import { useRepoSettings } from "@/hooks/settings";
import { getApiErrorMessage } from "@/lib/api-error";
import { message } from "@/lib/toast";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

dayjs.locale("th");

interface DocsContentProps {
  repoId: string;
}

export default function DocsContent({ repoId }: DocsContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const lastSyncedAtRef = useRef<string | null>(null);

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
    if (!status || !settings?.docsAutoSync || !status.isStale) return;
    if (status.status === "queued" || status.status === "running") return;
    void refresh().catch(() => undefined);
  }, [refresh, settings?.docsAutoSync, status]);

  useEffect(() => {
    if (!status?.lastGeneratedAt) return;
    if (status.lastGeneratedAt === lastSyncedAtRef.current) return;
    lastSyncedAtRef.current = status.lastGeneratedAt;
    if (status.status === "success") {
      message.success(status.message ?? "Docs updated");
    }
  }, [status]);

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

  const startEdit = () => {
    setEditContent(doc?.content ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await update(editContent);
      message.success("Docs saved");
      setIsEditing(false);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to save docs"));
    }
  };

  const handleGenerate = async () => {
    try {
      await generate();
      message.success("Full docs build queued");
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to start docs generation"));
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      message.success("Incremental docs refresh queued");
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to refresh docs"));
    }
  };

  const handleAutoUpdate = async () => {
    try {
      await autoUpdate();
      message.success("Auto update queued");
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to start auto update"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc();
      message.success("Docs removed");
      setIsEditing(false);
      setShowHistory(false);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to delete docs"));
    }
  };

  const handleToggleAutoSync = async (selected: boolean) => {
    try {
      await updateSettings({ docsAutoSync: selected });
      message.success(selected ? "Docs auto sync enabled" : "Docs auto sync disabled");
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to update docs auto sync"));
    }
  };

  const handleToggleOffline = async (selected: boolean) => {
    try {
      await updateSettings({ aiOfflineMode: selected });
      message.success(selected ? "AI offline mode enabled" : "AI offline mode disabled");
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to update AI mode"));
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
              ? `Last generated ${dayjs(status.lastGeneratedAt).format("DD MMM YYYY HH:mm")}`
              : doc
                ? `Updated ${dayjs(doc.updatedAt).format("DD MMM YYYY HH:mm")}`
                : ""}
          </span>
          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" isDisabled={isGenerating || isEditing} onPress={handleGenerate}>
              <Sparkles size={14} />
              Build docs
            </Button>
            <Button variant="secondary" size="sm" isDisabled={isRefreshing || isEditing} onPress={handleRefresh}>
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" isDisabled={isAutoUpdating || isEditing} onPress={handleAutoUpdate}>
              <Bot size={14} />
              Auto update
            </Button>
            <Button variant="secondary" size="sm" onPress={() => setShowHistory((value) => !value)}>
              <History size={14} />
              History
            </Button>
            {!isEditing ? (
              <Button variant="primary" size="sm" onPress={startEdit}>
                <Pencil size={14} />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="sm" onPress={() => setIsEditing(false)}>
                  <X size={14} />
                  Cancel
                </Button>
                <Button variant="primary" size="sm" isDisabled={isUpdating} onPress={handleSave}>
                  <Save size={14} />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </>
            )}
            {doc && (
              <ConfirmDialog
                title="Delete docs?"
                description="This removes the current docs history for the repository."
                confirmLabel="Delete"
                confirmVariant="danger"
                onConfirm={handleDelete}
                trigger={
                  <Button variant="danger" size="sm" isDisabled={isDeleting}>
                    <Trash2 size={14} />
                    Delete
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
                Docs auto sync
                <span className="block text-xs text-muted mt-1">
                  Queue incremental refresh when the latest repo commit changes.
                </span>
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
                AI offline mode
                <span className="block text-xs text-muted mt-1">
                  Prevent AI requests locally and keep backend workflows in offline-safe mode.
                </span>
              </Switch.Content>
            </Switch>
          </div>
        </div>

        {status && (
          <Alert status={statusTone} className="mb-4">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Docs pipeline</Alert.Title>
              <Alert.Description>
                <p className="text-sm">{status.message ?? "Docs are ready."}</p>
                <p className="text-xs text-muted mt-1">
                  {status.isStale ? "Repository changes are waiting to be documented." : "Docs match the latest tracked source revision."}
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
          <TextArea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Write repository documentation in Markdown..."
          />
        ) : !doc ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={48} className="opacity-20 mb-4" />
            <p className="text-muted mb-4">No project docs yet.</p>
            <Button variant="primary" onPress={handleGenerate}>
              Generate docs
            </Button>
          </div>
        ) : (
          <div className="markdown-body p-6 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[400px] text-sm leading-relaxed">
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
          <div className="font-semibold mb-3 text-sm">Version History</div>
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
