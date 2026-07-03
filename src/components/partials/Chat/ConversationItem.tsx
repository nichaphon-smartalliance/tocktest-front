"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog, Button, Dropdown } from "@heroui/react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { Conversation } from "@/types/app/chat";

dayjs.extend(relativeTime);

interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
  locale: string;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

/** Strips markdown syntax so code/formatted replies read as plain text in the preview line. */
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "$1")
    .replace(/^[ \t]*[-*+]\s+/gm, "")
    .replace(/^[ \t]*\d+\.\s+/gm, "");
}

function previewOf(conversation: Conversation): string | null {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return null;
  return stripMarkdown(last.content).replace(/\s+/g, " ").trim() || null;
}

export default function ConversationItem({
  conversation,
  active,
  locale,
  onSelect,
  onRename,
  onDelete,
}: ConversationItemProps) {
  const t = useTranslations("chatHistory");
  const tc = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = conversation.title || t("untitled");
  const rawPreview = previewOf(conversation);
  const preview = rawPreview ?? t("emptyPreview");
  // Hide the preview when it just repeats the title (e.g. a chat with only the
  // first user message, from which the title was derived).
  const hidePreview = rawPreview !== null && rawPreview === conversation.title;
  const time = dayjs(conversation.updatedAt).locale(locale).fromNow();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startRename = () => {
    setDraft(conversation.title || "");
    setEditing(true);
  };

  const commitRename = () => {
    if (!editing) return;
    const next = draft.trim();
    if (next && next !== conversation.title) onRename(next);
    setEditing(false);
  };

  const cancelRename = () => {
    setEditing(false);
    setDraft("");
  };

  const handleAction = (key: React.Key) => {
    if (key === "rename") startRename();
    else if (key === "delete") setDeleteOpen(true);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitRename();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelRename();
          }
        }}
        aria-label={t("renameAria")}
        className="w-full rounded-lg border border-indigo-400 bg-white px-2.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-[#4fc1ff] dark:bg-[#1e1e1e]"
      />
    );
  }

  return (
    <div
      className={`chat-fade-in group relative flex items-center rounded-lg transition-colors ${
        active ? "bg-indigo-500/14 dark:bg-[#37373d]" : "hover:bg-gray-100 dark:hover:bg-[#2a2d2e]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="min-w-0 flex-1 cursor-pointer px-2.5 py-2 text-left"
      >
        <span
          className={`block truncate text-[13px] leading-5 ${
            active ? "font-semibold text-indigo-600 dark:text-[#4fc1ff]" : "font-medium text-[var(--text-primary)]"
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          {!hidePreview && (
            <span className="min-w-0 flex-1 truncate text-xs leading-4 text-muted">{preview}</span>
          )}
          <span className="shrink-0 whitespace-nowrap text-[11px] leading-4 text-muted/70">{time}</span>
        </span>
      </button>

      <div className="shrink-0 pr-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <Dropdown>
          <Dropdown.Trigger
            aria-label={t("actionsAria")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-[var(--text-muted)] cursor-pointer hover:bg-gray-200/70 dark:hover:bg-[#3e3e42]"
          >
            <MoreHorizontal size={15} />
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu onAction={handleAction} aria-label={t("actionsAria")}>
              <Dropdown.Item id="rename" textValue={t("rename")}>
                <span className="flex items-center gap-2">
                  <Pencil size={14} />
                  {t("rename")}
                </span>
              </Dropdown.Item>
              <Dropdown.Item id="delete" textValue={t("delete")} variant="danger">
                <span className="flex items-center gap-2">
                  <Trash2 size={14} />
                  {t("delete")}
                </span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      <AlertDialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>{t("deleteTitle")}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>{t("deleteDesc")}</AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="secondary">
                  {tc("cancel")}
                </Button>
                <Button slot="close" variant="danger" onPress={onDelete}>
                  {t("delete")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
