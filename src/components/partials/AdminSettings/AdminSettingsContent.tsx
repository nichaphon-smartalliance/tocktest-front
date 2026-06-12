"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Button,
  Table,
  Chip,
  TextField,
  Label,
  InputGroup,
  Switch,
  Spinner,
  Select,
  ListBox,
  Alert,
} from "@heroui/react";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { Trash2, Plus, User, Shield, Sliders, Github, Server, Bot, BotOff, Link2, Package, ChevronDown, ChevronUp, Download, Check, Webhook, RefreshCw } from "lucide-react";
import { useGithubTokens } from "@/hooks/repository";
import { useGithubAppSetup, useGithubAppInstallationRepositories, useJobStats, useRecentJobs } from "@/hooks/dashboard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebhookEventsApi, replayWebhookEventApi, type WebhookEventResponse } from "@/lib/api/api-main";
import { useUserProfile, useChangePassword, useUserSettings } from "@/hooks/user";
import { useAiHealth } from "@/hooks/ai/useAiHealth";
import type { GithubToken } from "@/types/app/repository";
import type { AdminSettingsTab } from "@/types/app/user";
import { AddTokenModal } from "@/components/partials/Dashboard/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import dayjs from "dayjs";

const TABS: { key: AdminSettingsTab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "โปรไฟล์", icon: User },
  { key: "security", label: "ความปลอดภัย", icon: Shield },
  { key: "preferences", label: "การตั้งค่า", icon: Sliders },
  { key: "integrations", label: "GitHub", icon: Github },
  { key: "webhooks", label: "Webhooks", icon: Webhook },
  { key: "system", label: "ระบบ", icon: Server },
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 รายการ" },
  { value: "20", label: "20 รายการ" },
  { value: "50", label: "50 รายการ" },
];

const LANG_OPTIONS = [
  { value: "th", label: "ไทย" },
  { value: "en", label: "English" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  user: "ผู้ใช้งาน",
};

export default function AdminSettingsContent() {
  const [tab, setTab] = useState<AdminSettingsTab>("profile");
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { profile, isLoading: profileLoading, updateProfile, isUpdating: profileUpdating } = useUserProfile();
  const { changePassword, isChanging } = useChangePassword();
  const { settings, isLoading: settingsLoading, update: updateSettings, isUpdating: settingsUpdating } =
    useUserSettings();
  const { tokens, isLoading: tokensLoading, deleteToken, connectGithub } = useGithubTokens();
  const { setup: githubAppSetup, installations, installApp } = useGithubAppSetup();
  const { data: jobStats } = useJobStats();
  const { data: recentJobs } = useRecentJobs();
  const { aiAvailable } = useAiHealth();
  const [expandedInstallationId, setExpandedInstallationId] = useState<string | null>(null);

  useEffect(() => {
    const githubStatus = searchParams.get("github");
    const githubAppStatus = searchParams.get("github_app");
    const installationId = searchParams.get("installation_id");
    if (githubStatus === "connected") {
      message.success("เชื่อมต่อบัญชี GitHub สำเร็จ");
    } else if (githubStatus === "error") {
      message.error("เชื่อมต่อบัญชี GitHub ไม่สำเร็จ กรุณาลองใหม่");
    }
    if (githubAppStatus === "install" || githubAppStatus === "update") {
      message.success("ติดตั้ง GitHub App สำเร็จ");
    } else if (githubAppStatus === "error") {
      message.error("ติดตั้ง GitHub App ไม่สำเร็จ กรุณาลองใหม่");
    }
    if (installationId) {
      setExpandedInstallationId(installationId);
    }
    if (githubStatus || githubAppStatus) {
      setTab("integrations");
      router.replace("/settings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [defaultPageSize, setDefaultPageSize] = useState("20");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState("th");

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setDefaultPageSize(String(settings.defaultPageSize));
      setEmailNotifications(settings.emailNotifications);
      setPreferredLanguage(settings.preferredLanguage);
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      message.warning("กรุณากรอกชื่อ");
      return;
    }
    try {
      await updateProfile(name.trim());
      message.success("อัปเดตโปรไฟล์สำเร็จ");
    } catch (error) {
      message.error(getApiErrorMessage(error, "อัปเดตโปรไฟล์ไม่สำเร็จ"));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      message.warning("กรุณากรอกรหัสผ่านให้ครบ");
      return;
    }
    if (newPassword.length < 6) {
      message.warning("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.warning("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      message.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      message.error(getApiErrorMessage(error, "เปลี่ยนรหัสผ่านไม่สำเร็จ"));
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updateSettings({
        defaultPageSize: Number(defaultPageSize),
        emailNotifications,
        preferredLanguage: preferredLanguage as "th" | "en",
      });
      message.success("บันทึกการตั้งค่าสำเร็จ");
    } catch (error) {
      message.error(getApiErrorMessage(error, "บันทึกไม่สำเร็จ"));
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteToken(id);
      message.success("ลบ Token สำเร็จ");
    } catch {
      message.error("ลบ Token ไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">การตั้งค่า</h1>
        <p className="text-sm text-muted mt-1">จัดการบัญชี ความปลอดภัย และการเชื่อมต่อของคุณ</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "primary" : "secondary"}
            onPress={() => setTab(key)}
          >
            <Icon size={14} />
            {label}
          </Button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="rounded-xl">
          <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <Card.Title className="text-base font-semibold m-0">โปรไฟล์</Card.Title>
          </Card.Header>
          <Card.Content className="px-5 py-4 flex flex-col gap-4">
            {profileLoading ? (
              <Spinner />
            ) : (
              <>
                <TextField value={name} onChange={setName} isRequired>
                  <Label>ชื่อที่แสดง</Label>
                  <InputGroup>
                    <InputGroup.Input placeholder="ชื่อของคุณ" />
                  </InputGroup>
                </TextField>
                <TextField value={profile?.email ?? ""} isReadOnly>
                  <Label>อีเมล</Label>
                  <InputGroup>
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">บทบาท:</span>
                  <Chip size="sm" variant="soft" color={profile?.role === "admin" ? "accent" : undefined}>
                    <Chip.Label>{ROLE_LABELS[profile?.role ?? "user"] ?? profile?.role}</Chip.Label>
                  </Chip>
                </div>
                {profile?.createdAt && (
                  <p className="text-xs text-muted">
                    สมัครใช้งานเมื่อ {dayjs(profile.createdAt).format("D MMM YYYY")}
                  </p>
                )}
                <Button variant="primary" isDisabled={profileUpdating} onPress={() => void handleSaveProfile()}>
                  {profileUpdating ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {tab === "security" && (
        <Card className="rounded-xl">
          <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <Card.Title className="text-base font-semibold m-0">เปลี่ยนรหัสผ่าน</Card.Title>
          </Card.Header>
          <Card.Content className="px-5 py-4 flex flex-col gap-4">
            <TextField value={currentPassword} onChange={setCurrentPassword} isRequired>
              <Label>รหัสผ่านปัจจุบัน</Label>
              <InputGroup>
                <InputGroup.Input type="password" autoComplete="current-password" />
              </InputGroup>
            </TextField>
            <TextField value={newPassword} onChange={setNewPassword} isRequired>
              <Label>รหัสผ่านใหม่</Label>
              <InputGroup>
                <InputGroup.Input type="password" autoComplete="new-password" />
              </InputGroup>
            </TextField>
            <TextField value={confirmPassword} onChange={setConfirmPassword} isRequired>
              <Label>ยืนยันรหัสผ่านใหม่</Label>
              <InputGroup>
                <InputGroup.Input type="password" autoComplete="new-password" />
              </InputGroup>
            </TextField>
            <Button variant="primary" isDisabled={isChanging} onPress={() => void handleChangePassword()}>
              {isChanging ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
            </Button>
          </Card.Content>
        </Card>
      )}

      {tab === "preferences" && (
        <Card className="rounded-xl">
          <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <Card.Title className="text-base font-semibold m-0">การตั้งค่าทั่วไป</Card.Title>
          </Card.Header>
          <Card.Content className="px-5 py-4 flex flex-col gap-4">
            {settingsLoading ? (
              <Spinner />
            ) : (
              <>
                <Select
                  selectedKey={defaultPageSize}
                  onSelectionChange={(key) => key && setDefaultPageSize(String(key))}
                >
                  <Label className="mb-1.5">จำนวนรายการต่อหน้า (เริ่มต้น)</Label>
                  <Select.Trigger className="w-full max-w-xs">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {PAGE_SIZE_OPTIONS.map((o) => (
                        <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                          {o.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  selectedKey={preferredLanguage}
                  onSelectionChange={(key) => key && setPreferredLanguage(String(key))}
                >
                  <Label className="mb-1.5">ภาษา</Label>
                  <Select.Trigger className="w-full max-w-xs">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {LANG_OPTIONS.map((o) => (
                        <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                          {o.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Switch isSelected={emailNotifications} onChange={setEmailNotifications}>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Content>รับการแจ้งเตือนทางอีเมล (เมื่อพร้อมใช้งาน)</Switch.Content>
                </Switch>

                <Button variant="primary" isDisabled={settingsUpdating} onPress={() => void handleSavePreferences()}>
                  {settingsUpdating ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {tab === "integrations" && (
        <div className="flex flex-col gap-4 mb-4">
          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <Card.Title className="text-base font-semibold m-0">เชื่อมต่อบัญชี GitHub</Card.Title>
                <p className="text-xs text-muted mt-0.5">
                  เข้าสู่ระบบด้วยบัญชี GitHub แทนการกรอก Personal Access Token เอง
                </p>
              </div>
            </Card.Header>
            <Card.Content className="px-5 py-4 flex flex-col gap-3">
              {tokens.some((t) => t.provider === "oauth") ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Github size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium">
                      เชื่อมต่อแล้วกับ @{tokens.find((t) => t.provider === "oauth")?.githubLogin}
                    </span>
                  </div>
                  <Chip size="sm" variant="soft" color="success">
                    <Chip.Label>เชื่อมต่อแล้ว</Chip.Label>
                  </Chip>
                </div>
              ) : (
                <Button variant="primary" onPress={() => void connectGithub()}>
                  <Link2 size={14} />
                  เชื่อมต่อด้วย GitHub
                </Button>
              )}
            </Card.Content>
          </Card>

          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <Card.Title className="text-base font-semibold m-0">GitHub App & Webhooks</Card.Title>
                <p className="text-xs text-muted mt-0.5">
                  ติดตั้ง GitHub App เพื่อรับ webhook และเขียน comment/status กลับไปที่ PR อัตโนมัติ
                </p>
              </div>
            </Card.Header>
            <Card.Content className="px-5 py-4 flex flex-col gap-3">
              {!githubAppSetup?.configured ? (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      GitHub App ยังไม่ได้ตั้งค่าบนเซิร์ฟเวอร์ (ต้องระบุ GITHUB_APP_ID, PRIVATE_KEY และ WEBHOOK_SECRET)
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : (
                <>
                  {installations.length === 0 ? (
                    <Button variant="primary" onPress={() => void installApp()}>
                      <Package size={14} />
                      ติดตั้ง GitHub App
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {installations.map((inst) => {
                        const isExpanded = expandedInstallationId === inst.installationId;
                        return (
                          <div
                            key={inst.id}
                            className="rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedInstallationId(isExpanded ? null : inst.installationId)
                              }
                              className="flex w-full items-center justify-between px-4 py-3 text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Package size={18} className="text-emerald-500" />
                                <span className="text-sm font-medium">
                                  {inst.accountLogin ?? `Installation #${inst.installationId}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Chip size="sm" variant="soft" color={inst.suspendedAt ? "danger" : "success"}>
                                  <Chip.Label>{inst.suspendedAt ? "ถูกระงับ" : "ใช้งานได้"}</Chip.Label>
                                </Chip>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </button>
                            {isExpanded && (
                              <InstallationRepositoryPanel installationId={inst.installationId} />
                            )}
                          </div>
                        );
                      })}
                      <Button size="sm" variant="secondary" onPress={() => void installApp()}>
                        <Plus size={14} />
                        จัดการ / เพิ่ม repository
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        </div>
      )}

      {tab === "integrations" && (
        <Card className="rounded-xl">
          <Card.Header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <Card.Title className="text-base font-semibold m-0">GitHub Tokens</Card.Title>
              <p className="text-xs text-muted mt-0.5">ใช้ดึง repository และ commit จาก GitHub</p>
            </div>
            <Button size="sm" variant="secondary" onPress={() => setAddTokenOpen(true)}>
              <Plus size={14} />
              เพิ่ม Token
            </Button>
          </Card.Header>
          <Card.Content className="p-0">
            {tokensLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Github size={32} className="mx-auto text-muted mb-2" />
                <p className="text-sm font-medium mb-1">ยังไม่มี GitHub Token</p>
                <p className="text-xs text-muted mb-4">เพิ่ม token เพื่อ sync repo และวิเคราะห์ commit</p>
                <Button size="sm" variant="primary" onPress={() => setAddTokenOpen(true)}>
                  <Plus size={14} />
                  เพิ่ม Token
                </Button>
              </div>
            ) : (
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label="GitHub tokens">
                    <Table.Header>
                      <Table.Column isRowHeader>ชื่อ</Table.Column>
                      <Table.Column>สถานะ</Table.Column>
                      <Table.Column>เพิ่มเมื่อ</Table.Column>
                      <Table.Column className="w-12" />
                    </Table.Header>
                    <Table.Body>
                      {tokens.map((record: GithubToken) => (
                        <Table.Row key={record.id} id={record.id}>
                          <Table.Cell>
                            <span className="font-medium">{record.label}</span>
                          </Table.Cell>
                          <Table.Cell>
                            <Chip size="sm" variant="soft" color={record.isActive ? "success" : "danger"}>
                              <Chip.Label>{record.isActive ? "ใช้งานได้" : "ไม่ได้ใช้งาน"}</Chip.Label>
                            </Chip>
                          </Table.Cell>
                          <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                          <Table.Cell>
                            <ConfirmDialog
                              title="ลบ Token นี้?"
                              confirmLabel="ลบ"
                              confirmVariant="danger"
                              onConfirm={() => handleDeleteToken(record.id)}
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
            )}
          </Card.Content>
        </Card>
      )}

      {tab === "system" && (
        <div className="flex flex-col gap-4">
          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <Card.Title className="text-base font-semibold m-0">สถานะบริการ</Card.Title>
            </Card.Header>
            <Card.Content className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  {aiAvailable ? (
                    <Bot size={18} className="text-indigo-500" />
                  ) : (
                    <BotOff size={18} className="text-amber-500" />
                  )}
                  <span className="text-sm font-medium">AI Service</span>
                </div>
                <Chip size="sm" variant="soft" color={aiAvailable ? "success" : "warning"}>
                  <Chip.Label>{aiAvailable ? "พร้อมใช้งาน" : "offline"}</Chip.Label>
                </Chip>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                <span className="text-sm font-medium">Backend API</span>
                <Chip size="sm" variant="soft" color="success">
                  <Chip.Label>{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4004"}</Chip.Label>
                </Chip>
              </div>
              {jobStats && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: "Pending", value: jobStats.pending, color: "text-amber-600" },
                    { label: "Processing", value: jobStats.processing, color: "text-sky-600" },
                    { label: "Completed", value: jobStats.completed, color: "text-emerald-600" },
                    { label: "Failed", value: jobStats.failed, color: "text-rose-600" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                      <p className={`m-0 text-lg font-semibold ${item.color}`}>{item.value}</p>
                      <p className="m-0 text-xs text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <Card.Title className="text-base font-semibold m-0">Recent automation jobs</Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              {!recentJobs?.length ? (
                <div className="px-5 py-6 text-sm text-muted">No background jobs have run yet.</div>
              ) : (
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Recent background jobs">
                      <Table.Header>
                        <Table.Column isRowHeader>Type</Table.Column>
                        <Table.Column>Status</Table.Column>
                        <Table.Column>Attempts</Table.Column>
                        <Table.Column>Created</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {recentJobs.slice(0, 8).map((job) => (
                          <Table.Row key={job.id} id={job.id}>
                            <Table.Cell>
                              <span className="font-medium">{job.type}</span>
                            </Table.Cell>
                            <Table.Cell>
                              <Chip
                                size="sm"
                                variant="soft"
                                color={
                                  job.status === "completed"
                                    ? "success"
                                    : job.status === "failed"
                                      ? "danger"
                                      : job.status === "processing"
                                        ? "accent"
                                        : "warning"
                                }
                              >
                                <Chip.Label>{job.status}</Chip.Label>
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>{job.attempts}/{job.maxAttempts}</Table.Cell>
                            <Table.Cell>{dayjs(job.createdAt).format("DD/MM HH:mm")}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              )}
            </Card.Content>
          </Card>

          {!aiAvailable && (
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  AI server ไม่พร้อม — ฟีเจอร์สร้าง test case และวิเคราะห์ commit จะใช้โหมด offline
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </div>
      )}

      {tab === "webhooks" && <WebhookEventsPanel />}

      <AddTokenModal open={addTokenOpen} onClose={() => setAddTokenOpen(false)} />
    </div>
  );
}

function WebhookEventsPanel() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["webhook-events", statusFilter],
    queryFn: () => getWebhookEventsApi({ limit: 50, status: statusFilter || undefined }).then((r) => r.data?.data ?? []),
    staleTime: 10_000,
  });

  const replayMutation = useMutation({
    mutationFn: (eventId: string) => replayWebhookEventApi(eventId),
    onSuccess: () => {
      message.success("Webhook replayed");
      void qc.invalidateQueries({ queryKey: ["webhook-events"] });
    },
    onError: (err) => message.error(getApiErrorMessage(err, "Replay failed")),
  });

  const statusColor = (status: string): "success" | "danger" | "warning" | "accent" => {
    if (status === "processed") return "success";
    if (status === "failed") return "danger";
    if (status === "replaying") return "accent";
    return "warning";
  };

  return (
    <Card className="rounded-xl">
      <Card.Header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <Card.Title className="text-base font-semibold m-0">Webhook Events</Card.Title>
          <p className="text-xs text-muted mt-0.5">View and replay GitHub webhook events</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-transparent"
          >
            <option value="">All statuses</option>
            <option value="received">received</option>
            <option value="processed">processed</option>
            <option value="failed">failed</option>
          </select>
          <button
            type="button"
            onClick={() => void qc.invalidateQueries({ queryKey: ["webhook-events"] })}
            className="text-muted hover:text-primary transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </Card.Header>
      <Card.Content className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !events?.length ? (
          <div className="px-5 py-6 text-sm text-muted">No webhook events found.</div>
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Webhook events">
                <Table.Header>
                  <Table.Column isRowHeader>Event</Table.Column>
                  <Table.Column>Repository</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column>Received</Table.Column>
                  <Table.Column className="w-16" />
                </Table.Header>
                <Table.Body>
                  {events.map((ev: WebhookEventResponse) => (
                    <Table.Row key={ev.id} id={ev.id}>
                      <Table.Cell>
                        <span className="font-mono text-xs">{ev.event}{ev.action ? `.${ev.action}` : ""}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-muted">{ev.repoFullName ?? "—"}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="soft" color={statusColor(ev.status)}>
                          <Chip.Label>{ev.status}</Chip.Label>
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-muted">{dayjs(ev.createdAt).format("DD/MM HH:mm:ss")}</span>
                      </Table.Cell>
                      <Table.Cell>
                        {ev.status === "failed" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isDisabled={replayMutation.isPending}
                            onPress={() => replayMutation.mutate(ev.id)}
                          >
                            <RefreshCw size={12} />
                            Replay
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
      </Card.Content>
    </Card>
  );
}

function InstallationRepositoryPanel({ installationId }: { installationId: string }) {
  const { repositories, isLoading, importRepository, isImporting } =
    useGithubAppInstallationRepositories(installationId);
  const [importingFullName, setImportingFullName] = useState<string | null>(null);

  const handleImport = async (fullName: string) => {
    setImportingFullName(fullName);
    try {
      await importRepository(fullName);
      message.success(`นำเข้า ${fullName} สำเร็จ`);
    } catch (error) {
      message.error(getApiErrorMessage(error, `นำเข้า ${fullName} ไม่สำเร็จ`));
    } finally {
      setImportingFullName(null);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : repositories.length === 0 ? (
        <p className="text-xs text-muted">ไม่พบ repository สำหรับ installation นี้</p>
      ) : (
        <div className="flex flex-col gap-2">
          {repositories.map((repo) => (
            <div
              key={repo.githubRepoId}
              className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{repo.fullName}</span>
                <span className="text-xs text-muted">
                  {repo.private ? "Private" : "Public"} · {repo.defaultBranch}
                </span>
              </div>
              {repo.tracked ? (
                <Chip size="sm" variant="soft" color="success">
                  <Chip.Label className="flex items-center gap-1">
                    <Check size={12} />
                    เพิ่มแล้ว
                  </Chip.Label>
                </Chip>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={isImporting}
                  onPress={() => void handleImport(repo.fullName)}
                >
                  {isImporting && importingFullName === repo.fullName ? (
                    <Spinner size="sm" />
                  ) : (
                    <Download size={14} />
                  )}
                  นำเข้า
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
