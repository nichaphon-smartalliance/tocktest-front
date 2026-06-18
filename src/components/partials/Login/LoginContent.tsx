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
import { FlaskConical, Mail, Lock, Eye, EyeOff, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginContent() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onGithubSignIn = () => {
    setGithubLoading(true);
    setError(null);
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t("emailRequired"));
      return;
    }
    if (!password) {
      setError(t("passwordRequired"));
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
      setError(t("invalidCredentials"));
    }
  };

  return (
    <div className="login-stage w-full max-w-[440px] px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <div className="surface-card flex h-18 w-18 items-center justify-center rounded-[1.75rem]">
            <FlaskConical size={42} className="text-indigo-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-indigo-500 m-0">TockTest</h1>
        <p className="text-sm text-muted mt-1">{tCommon("tagline")}</p>
      </div>

      <Card className="surface-card rounded-[1.75rem] shadow-none">
        <Card.Content className="p-8">
          <h2 className="text-lg font-semibold text-center mb-6">{t("signIn")}</h2>

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
              <Label>{t("email")}</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Mail size={16} className="opacity-40" />
                </InputGroup.Prefix>
                <InputGroup.Input type="email" placeholder="admin@tocktest.com" />
              </InputGroup>
            </TextField>

            <TextField value={password} onChange={setPassword} isRequired>
              <Label>{t("password")}</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Lock size={16} className="opacity-40" />
                </InputGroup.Prefix>
                <InputGroup.Input type={showPassword ? "text" : "password"} placeholder="••••••••" />
                <InputGroup.Suffix>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/14" />
            <span className="text-xs text-muted">{t("or")}</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/14" />
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            isDisabled={githubLoading}
            onPress={onGithubSignIn}
            className="h-11 font-semibold"
          >
            {githubLoading ? <Spinner size="sm" color="current" /> : <Github size={18} />}
            {t("signInWithGithub")}
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
