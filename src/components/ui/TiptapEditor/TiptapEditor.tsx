"use client";

import { useCallback, useEffect, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Undo2,
} from "lucide-react";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB inline base64 cap

interface TiptapEditorProps {
  /** Markdown source (single source of truth). */
  value: string;
  /** Emits markdown on every edit. */
  onChange: (markdown: string) => void;
  placeholder?: string;
  editable?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-md border text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "border-indigo-400 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
          : "border-gray-200 dark:border-[#3e3e42] hover:bg-gray-100 dark:hover:bg-[#2a2d2e]"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_IMAGE_BYTES) {
        // eslint-disable-next-line no-alert
        window.alert("Image is larger than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const src = typeof reader.result === "string" ? reader.result : "";
        if (src) editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    },
    [editor],
  );

  const addImageByUrl = useCallback(() => {
    // eslint-disable-next-line no-alert
    const url = window.prompt("Image URL (http/https or paste a direct image link)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      // eslint-disable-next-line no-alert
      window.alert("Please enter a valid http/https URL.");
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const previous = (editor.getAttributes("link").href as string) ?? "";
    // eslint-disable-next-line no-alert
    const url = window.prompt("Link URL", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:|mailto:|\/)/i.test(url)) {
      // eslint-disable-next-line no-alert
      window.alert("Only http(s), mailto, or relative links are allowed.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-[#3e3e42] p-2">
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3e3e42]" />

      <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3e3e42]" />

      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton label="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3e3e42]" />

      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Upload image (file)" onClick={() => imageInputRef.current?.click()}>
        <ImagePlus size={15} />
      </ToolbarButton>
      <ToolbarButton label="Insert image by URL" onClick={addImageByUrl}>
        <ImagePlus size={15} />
        <span className="text-[9px] font-bold leading-none ml-0.5">URL</span>
      </ToolbarButton>
      <ToolbarButton
        label="Insert table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3e3e42]" />

      <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={15} />
      </ToolbarButton>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addImageFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default function TiptapEditor({ value, onChange, placeholder, editable = true }: TiptapEditorProps) {
  // Tracks the last markdown we emitted so external value-sync does not clobber typing.
  const lastEmitted = useRef<string>(value);

  const editor = useEditor({
    editable,
    immediatelyRender: false, // required for Next.js SSR to avoid hydration mismatch
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      const markdown = ed.storage.markdown.getMarkdown() as string;
      lastEmitted.current = markdown;
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: "markdown-body tiptap-editor focus:outline-none min-h-[420px] px-4 py-3",
      },
    },
  });

  // Push external markdown changes (e.g. raw source textarea) into the editor.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, false);
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#3e3e42] overflow-hidden bg-white dark:bg-[#1e1e1e]">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
