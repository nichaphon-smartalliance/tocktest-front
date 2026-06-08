"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, Table, Tag, Popconfirm, message, Space } from "antd";
import { DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useGithubTokens } from "@/hooks/repository";
import type { GithubToken } from "@/types/app/repository";
import dayjs from "dayjs";

interface AddTokenModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTokenModal({ open, onClose }: AddTokenModalProps) {
  const [form] = Form.useForm();
  const [tab, setTab] = useState<"list" | "add">("list");
  const { tokens, isLoading, createToken, isCreating, deleteToken } = useGithubTokens();

  const handleAdd = async (values: { label: string; token: string }) => {
    try {
      await createToken(values);
      message.success("เพิ่ม GitHub Token สำเร็จ");
      form.resetFields();
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

  const columns = [
    { title: "ชื่อ", dataIndex: "label", key: "label", render: (v: string) => <b>{v}</b> },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"} icon={<CheckCircleOutlined />}>
          {v ? "ใช้งานได้" : "ไม่ได้ใช้งาน"}
        </Tag>
      ),
    },
    {
      title: "วันที่เพิ่ม",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "",
      key: "action",
      render: (_: unknown, record: GithubToken) => (
        <Popconfirm title="ลบ Token นี้?" onConfirm={() => handleDelete(record.id)} okText="ลบ" cancelText="ยกเลิก">
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="จัดการ GitHub Token"
      width={600}
      styles={{ body: { padding: "16px 0 0" } }}
    >
      <Space style={{ marginBottom: 16 }}>
        <Button type={tab === "list" ? "primary" : "default"} onClick={() => setTab("list")}>
          รายการ Token
        </Button>
        <Button type={tab === "add" ? "primary" : "default"} onClick={() => setTab("add")}>
          + เพิ่ม Token
        </Button>
      </Space>

      {tab === "list" ? (
        <Table
          dataSource={tokens}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="small"
          locale={{ emptyText: "ยังไม่มี Token" }}
        />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleAdd} requiredMark={false}>
          <Form.Item
            name="label"
            label="ชื่อ Token"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input placeholder="เช่น Personal / Work" />
          </Form.Item>
          <Form.Item
            name="token"
            label="GitHub Personal Access Token"
            rules={[{ required: true, message: "กรุณากรอก Token" }]}
            extra="สร้าง token ที่ GitHub → Settings → Developer settings → Personal access tokens"
          >
            <Input.Password placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={isCreating} block>
              บันทึก Token
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
