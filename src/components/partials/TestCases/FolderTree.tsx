"use client";

import { useState } from "react";
import { Tree, Button, Dropdown, Input, Modal, Spin } from "antd";
import { message } from "@/lib/antd-static";
import type { TreeDataNode } from "antd";
import { FolderOutlined, FolderOpenOutlined, PlusOutlined, EllipsisOutlined } from "@ant-design/icons";
import type { TestCaseFolder } from "@/types/app/testCase";
import { useTestCaseFolders } from "@/hooks/testCase";

interface FolderTreeProps {
  repoId: string;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

function foldersToTreeData(folders: TestCaseFolder[]): TreeDataNode[] {
  return folders.map((f) => ({
    key: f.id,
    title: f.name,
    icon: ({ expanded }: { expanded?: boolean }) =>
      expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
    children: f.children ? foldersToTreeData(f.children) : [],
  }));
}

export default function FolderTree({ repoId, selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const { folders, isLoading, createFolder, deleteFolder } = useTestCaseFolders(repoId);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({ name: newFolderName.trim() });
      message.success("สร้างโฟลเดอร์สำเร็จ");
      setNewFolderName("");
      setCreateModalOpen(false);
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
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px", borderBottom: "1px solid #f0f0f0", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>โฟลเดอร์</span>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        />
      </div>

      {/* All test cases */}
      <div
        onClick={() => onSelectFolder(null)}
        style={{
          padding: "6px 12px",
          cursor: "pointer",
          borderRadius: 6,
          backgroundColor: selectedFolderId === null ? "#6366f115" : "transparent",
          fontWeight: selectedFolderId === null ? 600 : 400,
          fontSize: 13,
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FolderOpenOutlined style={{ opacity: 0.5 }} />
        ทั้งหมด
      </div>

      <Spin spinning={isLoading}>
        <Tree
          showIcon
          blockNode
          selectedKeys={selectedFolderId ? [selectedFolderId] : []}
          onSelect={(keys) => onSelectFolder(keys[0] as string ?? null)}
          treeData={foldersToTreeData(folders)}
          style={{ fontSize: 13 }}
          titleRender={(node) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span>{node.title as string}</span>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "delete",
                      label: "ลบโฟลเดอร์",
                      danger: true,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        handleDelete(node.key as string);
                      },
                    },
                  ],
                }}
                trigger={["click"]}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<EllipsisOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ opacity: 0, transition: "opacity 0.2s" }}
                  className="folder-action-btn"
                />
              </Dropdown>
            </div>
          )}
        />
      </Spin>

      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreate}
        title="สร้างโฟลเดอร์ใหม่"
        okText="สร้าง"
        cancelText="ยกเลิก"
      >
        <Input
          placeholder="ชื่อโฟลเดอร์"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleCreate}
          autoFocus
        />
      </Modal>
    </div>
  );
}
