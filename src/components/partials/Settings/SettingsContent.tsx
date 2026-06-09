"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  Divider,
  Typography,
} from "antd";
import { message } from "@/lib/antd-static";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useGithubTokens } from "@/hooks/repository";
import { useRepoSettings } from "@/hooks/settings";
import type { GithubToken } from "@/types/app/repository";
import { AddTokenModal } from "@/components/partials/Dashboard/Modal";
import dayjs from "dayjs";

const { Title } = Typography;

interface SettingsContentProps {
  repoId: string;
}

export default function SettingsContent({ repoId }: SettingsContentProps) {
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const { tokens, isLoading: isLoadingTokens, deleteToken } = useGithubTokens();
  const { settings, isLoading, update, isUpdating } = useRepoSettings(repoId);
  const [form] = Form.useForm();

  const handleSaveSettings = async () => {
    const values = await form.validateFields();
    try {
      await update(values);
      message.success("บันทึกการตั้งค่าสำเร็จ");
    } catch {
      message.error("บันทึกไม่สำเร็จ");
    }
  };

  const tokenColumns = [
    { title: "ชื่อ", dataIndex: "label", key: "label", render: (v: string) => <b>{v}</b> },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => <Tag color={v ? "green" : "red"}>{v ? "ใช้งานได้" : "ไม่ได้ใช้งาน"}</Tag>,
    },
    {
      title: "เพิ่มเมื่อ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "วันหมดอายุ",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (v: string | null) => {
        if (!v) return <span style={{ opacity: 0.5 }}>ไม่มีกำหนด</span>;
        const isExpired = dayjs(v).isBefore(dayjs());
        return (
          <Tag color={isExpired ? "red" : "blue"}>
            {dayjs(v).format("DD/MM/YYYY")} {isExpired && <span>(หมดอายุแล้ว)</span>}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "action",
      render: (_: unknown, record: GithubToken) => (
        <Popconfirm title="ลบ Token นี้?" onConfirm={() => deleteToken(record.id)} okText="ลบ" cancelText="ยกเลิก">
          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 700 }}>
      {/* GitHub Tokens */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>GitHub Tokens</Title>}
        extra={
          <Button size="small" icon={<PlusOutlined />} onClick={() => setAddTokenOpen(true)}>
            เพิ่ม Token
          </Button>
        }
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Table
          dataSource={tokens}
          columns={tokenColumns}
          rowKey="id"
          loading={isLoadingTokens}
          pagination={false}
          size="small"
          locale={{ emptyText: "ยังไม่มี GitHub Token" }}
        />
      </Card>

      {/* Repo Settings */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>ตั้งค่า Repository</Title>}
        style={{ borderRadius: 8 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={settings ?? {}}
          requiredMark={false}
        >
          <Form.Item name="defaultBranch" label="Default Branch">
            <Input placeholder="main" />
          </Form.Item>
          <Form.Item name="autoAnalyzeOnPush" label="วิเคราะห์ commit อัตโนมัติเมื่อมี push" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" loading={isUpdating} onClick={handleSaveSettings}>
              บันทึกการตั้งค่า
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <AddTokenModal open={addTokenOpen} onClose={() => setAddTokenOpen(false)} />
    </div>
  );
}
