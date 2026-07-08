"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog, Button, Dropdown } from "@heroui/react";
import { useTranslations } from "next-intl";
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
        className="w-full rounded-[10px] border border-[#6D5DFC] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6D5DFC]/40 dark:border-[#4fc1ff] dark:bg-[#1e1e1e]"
      />
    );
  }

  return (
    <div
      className={`chat-fade-in group relative flex items-center overflow-hidden rounded-[10px] transition-colors duration-200 ${
        active
          ? "bg-[#F6F4FF] shadow-sm dark:bg-[#37373d]"  
          : "hover:bg-[#ECE9FF] dark:hover:bg-[#2a2d2e]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer px-3 py-2.5 text-left"
      >
        <MessageSquare
          size={16}
          className={`shrink-0 ${active ? "text-[#6D5DFC] dark:text-[#4fc1ff]" : "text-[var(--text-muted)]"}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm leading-5 ${
              active
                ? "font-semibold text-[#6D5DFC] dark:text-[#4fc1ff]"
                : "font-medium text-[var(--text-primary)]"
            }`}
          >
            {title}
          </span>
          <span className="mt-0.5 block truncate text-xs leading-4 text-muted">{time}</span>
        </span>
      </button>

      <div className="shrink-0 pr-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <Dropdown>
          <Dropdown.Trigger
            aria-label={t("actionsAria")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-[var(--text-muted)] cursor-pointer hover:bg-black/5 dark:hover:bg-[#3e3e42]"
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
