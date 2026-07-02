"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog, Button, Dropdown } from "@heroui/react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Pencil, Copy, Pin, PinOff, Trash2 } from "lucide-react";
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
  onDuplicate: () => void;
  onTogglePin: () => void;
}

function previewOf(conversation: Conversation): string | null {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return null;
  return last.content.replace(/\s+/g, " ").trim() || null;
}

export default function ConversationItem({
  conversation,
  active,
  locale,
  onSelect,
  onRename,
  onDelete,
  onDuplicate,
  onTogglePin,
}: ConversationItemProps) {
  const t = useTranslations("chatHistory");
  const tc = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = conversation.title || t("untitled");
  const preview = previewOf(conversation) ?? t("emptyPreview");
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
    else if (key === "pin") onTogglePin();
    else if (key === "duplicate") onDuplicate();
    else if (key === "delete") setDeleteOpen(true);
  };

  return (
    <div
      className={`chat-fade-in group relative rounded-xl border transition-colors ${
        active
          ? "border-indigo-300 bg-indigo-500/10 dark:border-transparent dark:bg-[#37373d]"
          : "border-transparent hover:bg-gray-100 dark:hover:bg-[#2a2d2e]"
      }`}
    >
      {editing ? (
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
          className="w-full rounded-xl border border-indigo-400 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-[#4fc1ff] dark:bg-[#1e1e1e]"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={onSelect}
            aria-current={active ? "true" : undefined}
            className="flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2.5 pr-9 text-left"
          >
            <span className="flex items-center gap-1.5">
              {conversation.pinned && (
                <Pin size={11} className="shrink-0 text-indigo-500 dark:text-[#4fc1ff]" aria-hidden />
              )}
              <span
                className={`truncate text-sm font-medium ${
                  active ? "text-indigo-700 dark:text-[#4fc1ff]" : "text-[var(--text-primary)]"
                }`}
              >
                {title}
              </span>
            </span>
            <span className="truncate text-xs text-muted">{preview}</span>
            <span className="text-[11px] text-muted/80">{time}</span>
          </button>

          <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <Dropdown>
              <Dropdown.Trigger
                aria-label={t("actionsAria")}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border-0 bg-transparent text-[var(--text-muted)] cursor-pointer hover:bg-gray-200/70 dark:hover:bg-[#3e3e42]"
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
                  <Dropdown.Item id="pin" textValue={conversation.pinned ? t("unpin") : t("pin")}>
                    <span className="flex items-center gap-2">
                      {conversation.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                      {conversation.pinned ? t("unpin") : t("pin")}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="duplicate" textValue={t("duplicate")}>
                    <span className="flex items-center gap-2">
                      <Copy size={14} />
                      {t("duplicate")}
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
        </>
      )}

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
