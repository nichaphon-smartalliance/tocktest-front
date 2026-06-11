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
import { message } from "@/lib/toast";
import { Trash2, CheckCircle } from "lucide-react";
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
  const [tab, setTab] = useState<"list" | "add">("list");
  const [label, setLabel] = useState("");
  const [token, setToken] = useState("");
  const { tokens, isLoading, createToken, isCreating, deleteToken } = useGithubTokens();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !token.trim()) return;
    try {
      await createToken({ label: label.trim(), token: token.trim() });
      message.success("เพิ่ม GitHub Token สำเร็จ");
      setLabel("");
      setToken("");
      setTab("list");
    } catch {
      message.error("เพิ่ม Token ไม่สำเร็จ กรุณาตรวจสอบข้อมูล");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteToken(id);
      message.success("ลบ Token สำเร็จ");
    } catch {
      message.error("ลบ Token ไม่สำเร็จ");
    }
  };

  return (
    <ControlledModal open={open} onClose={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>จัดการ GitHub Token</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body>
              <div className="flex gap-2 mb-4">
                <Button variant={tab === "list" ? "primary" : "secondary"} size="sm" onPress={() => setTab("list")}>
                  รายการ Token
                </Button>
                <Button variant={tab === "add" ? "primary" : "secondary"} size="sm" onPress={() => setTab("add")}>
                  + เพิ่ม Token
                </Button>
              </div>

              {tab === "list" ? (
                isLoading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : tokens.length === 0 ? (
                  <p className="text-center text-muted py-8 text-sm">ยังไม่มี Token</p>
                ) : (
                  <Table>
                    <Table.ScrollContainer>
                      <Table.Content aria-label="GitHub tokens">
                        <Table.Header>
                          <Table.Column isRowHeader>ชื่อ</Table.Column>
                          <Table.Column>สถานะ</Table.Column>
                          <Table.Column>วันที่เพิ่ม</Table.Column>
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
                                    {record.isActive ? "ใช้งานได้" : "ไม่ได้ใช้งาน"}
                                  </Chip.Label>
                                </Chip>
                              </Table.Cell>
                              <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                              <Table.Cell>
                                <ConfirmDialog
                                  title="ลบ Token นี้?"
                                  confirmLabel="ลบ"
                                  confirmVariant="danger"
                                  onConfirm={() => handleDelete(record.id)}
                                  trigger={
                                    <Button variant="ghost" isIconOnly size="sm" aria-label="ลบ Token">
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
                    <Label>ชื่อ Token</Label>
                    <InputGroup><InputGroup.Input placeholder="เช่น Personal / Work" /></InputGroup>
                  </TextField>
                  <TextField value={token} onChange={setToken} isRequired>
                    <Label>GitHub Personal Access Token</Label>
                    <InputGroup><InputGroup.Input type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" /></InputGroup>
                    <p className="text-xs text-muted mt-1">สร้าง token ที่ GitHub → Settings → Developer settings → Personal access tokens</p>
                  </TextField>
                  <Button type="submit" variant="primary" fullWidth isDisabled={isCreating}>
                    {isCreating ? "กำลังบันทึก..." : "บันทึก Token"}
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
