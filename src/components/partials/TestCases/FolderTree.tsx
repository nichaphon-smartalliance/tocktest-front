"use client";

import { useState } from "react";
import {
  Button,
  Dropdown,
  TextField,
  Label,
  InputGroup,
  Modal,
  Spinner,
} from "@heroui/react";
import { ControlledModal } from "@/components/ui/ControlledModal";
import { message } from "@/lib/toast";
import {
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { TestCaseFolder } from "@/types/app/testCase";
import { useTestCaseFolders } from "@/hooks/testCase";

interface FolderTreeProps {
  repoId: string;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

function FolderNode({
  folder,
  selectedFolderId,
  onSelectFolder,
  onDelete,
  depth = 0,
}: {
  folder: TestCaseFolder;
  selectedFolderId: string | null;
  onSelectFolder: (id: string) => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md py-1.5 pr-1 text-sm cursor-pointer ${
          isSelected ? "bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="p-0.5 shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 min-w-0 cursor-pointer"
          onClick={() => onSelectFolder(folder.id)}
        >
          {expanded && hasChildren ? (
            <FolderOpen size={14} className="opacity-50 shrink-0" />
          ) : (
            <Folder size={14} className="opacity-50 shrink-0" />
          )}
          <span className="truncate">{folder.name}</span>
        </button>
        <Dropdown>
          <Dropdown.Trigger>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu
              onAction={() => onDelete(folder.id)}
              aria-label="Folder actions"
            >
              <Dropdown.Item id="delete" textValue="ลบโฟลเดอร์" variant="danger">
                ลบโฟลเดอร์
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
      {expanded &&
        hasChildren &&
        folder.children!.map((child) => (
          <FolderNode
            key={child.id}
            folder={child}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onDelete={onDelete}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export default function FolderTree({ repoId, selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const { folders, isLoading, createFolder, deleteFolder } = useTestCaseFolders(repoId);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setNewFolderName("");
  };

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({ name: newFolderName.trim() });
      message.success("สร้างโฟลเดอร์สำเร็จ");
      setNewFolderName("");
      closeCreateModal();
    } catch {
      message.error("สร้างโฟลเดอร์ไม่สำเร็จ");
    }
  };

  const handleDelete = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) onSelectFolder(null);
      message.success("ลบโฟลเดอร์สำเร็จ");
    } catch {
      message.error("ลบโฟลเดอร์ไม่สำเร็จ");
    }
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
        <span className="font-semibold text-sm">โฟลเดอร์</span>
        <Button
          variant="ghost"
          isIconOnly
          size="sm"
          aria-label="สร้างโฟลเดอร์"
          onPress={() => setCreateModalOpen(true)}
        >
          <Plus size={14} />
        </Button>
      </div>

      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={`flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-sm mb-1 cursor-pointer ${
          selectedFolderId === null
            ? "bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <FolderOpen size={14} className="opacity-50" />
        ทั้งหมด
      </button>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : (
        folders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onDelete={handleDelete}
          />
        ))
      )}

      <ControlledModal open={createModalOpen} onClose={closeCreateModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>สร้างโฟลเดอร์ใหม่</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <TextField value={newFolderName} onChange={setNewFolderName} autoFocus>
                  <Label>ชื่อโฟลเดอร์</Label>
                  <InputGroup>
                    <InputGroup.Input
                      placeholder="ชื่อโฟลเดอร์"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate();
                      }}
                    />
                  </InputGroup>
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  ยกเลิก
                </Button>
                <Button variant="primary" onPress={handleCreate}>
                  สร้าง
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </ControlledModal>
    </div>
  );
}
