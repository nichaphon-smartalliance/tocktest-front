"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Alert,
  TextField,
  Label,
  InputGroup,
  Spinner,
} from "@heroui/react";
import { FlaskConical, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
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
    <div className="w-full max-w-[420px] px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <FlaskConical size={48} className="text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-indigo-500 m-0">TockTest</h1>
        <p className="text-sm text-muted mt-1">AI-First QA Platform</p>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <Card.Content className="p-8">
          <h2 className="text-lg font-semibold text-center mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <Alert status="danger" className="mb-5">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField value={email} onChange={setEmail} isRequired>
              <Label>อีเมล</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Mail size={16} className="opacity-40" />
                </InputGroup.Prefix>
                <InputGroup.Input type="email" placeholder="admin@tocktest.com" />
              </InputGroup>
            </TextField>

            <TextField value={password} onChange={setPassword} isRequired>
              <Label>รหัสผ่าน</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Lock size={16} className="opacity-40" />
                </InputGroup.Prefix>
                <InputGroup.Input type={showPassword ? "text" : "password"} placeholder="••••••••" />
                <InputGroup.Suffix>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    className="cursor-pointer opacity-40 hover:opacity-70 transition-opacity"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isDisabled={loading}
              className="h-11 font-semibold mt-2"
            >
              {loading && <Spinner size="sm" color="current" />}
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
