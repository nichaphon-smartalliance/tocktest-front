"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function LoginContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧪</div>
        <Title level={2} style={{ margin: 0, color: "#6366f1" }}>
          TockTest
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          AI-First QA Platform
        </Text>
      </div>

      <Card
        style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        styles={{ body: { padding: 32 } }}
      >
        <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>
          เข้าสู่ระบบ
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล" },
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input prefix={<MailOutlined style={{ opacity: 0.4 }} />} placeholder="admin@tocktest.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
          >
            <Input.Password prefix={<LockOutlined style={{ opacity: 0.4 }} />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontWeight: 600, fontSize: 15 }}
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
