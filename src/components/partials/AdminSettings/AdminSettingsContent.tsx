"use client";

import { Alert, Button, Card, Chip, InputGroup, Label, Spinner, Table, TextField } from "@heroui/react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Github,
  Link2,
  Package,
  Plus,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { AddTokenModal } from "@/components/partials/Dashboard/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useGithubAppInstallationRepositories, useGithubAppSetup } from "@/hooks/dashboard";
import { useGithubTokens } from "@/hooks/repository";
import { useChangePassword, useUserProfile } from "@/hooks/user";
import { getApiErrorMessage } from "@/lib/api-error";
import { message } from "@/lib/toast";
import type { GithubToken } from "@/types/app/repository";
import type { AdminSettingsTab } from "@/types/app/user";

const TAB_CONFIG: { key: AdminSettingsTab; labelKey: string; icon: typeof User }[] = [
  { key: "profile", labelKey: "tabProfile", icon: User },
  { key: "security", labelKey: "tabSecurity", icon: Shield },
  { key: "integrations", labelKey: "tabIntegrations", icon: Github },
];

export default function AdminSettingsContent() {
  const [tab, setTab] = useState<AdminSettingsTab>("profile");
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const [expandedInstallationId, setExpandedInstallationId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("adminSettings");
  const tCommon = useTranslations("common");

  const { profile, isLoading: profileLoading, updateProfile, isUpdating: profileUpdating } = useUserProfile();
  const { changePassword, isChanging } = useChangePassword();
  const { tokens, isLoading: tokensLoading, deleteToken, connectGithub } = useGithubTokens();
  const { setup: githubAppSetup, installations, installApp } = useGithubAppSetup();


  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  useEffect(() => {
    const githubStatus = searchParams.get("github");
    const githubAppStatus = searchParams.get("github_app");
    const installationId = searchParams.get("installation_id");

    if (githubStatus === "connected") {
      message.success(t("toastGithubConnected"));
    } else if (githubStatus === "error") {
      message.error(t("toastGithubConnectFail"));
    }

    if (githubAppStatus === "install" || githubAppStatus === "update") {
      message.success(t("toastAppInstalled"));
    } else if (githubAppStatus === "error") {
      message.error(t("toastAppInstallFail"));
    }

    if (installationId) {
      setExpandedInstallationId(installationId);
    }

    if (githubStatus || githubAppStatus) {
      setTab("integrations");
      router.replace("/settings");
    }
  }, [router, searchParams, t]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatarDataUrl(localStorage.getItem(`avatar_${profile.id}`));
    }
  }, [profile]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) {
      message.warning(t("toastAvatarTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setAvatarDataUrl(src);
      localStorage.setItem(`avatar_${profile.id}`, src);
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { src } }));
      message.success(t("toastAvatarUpdated"));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const roleLabels: Record<string, string> = {
    admin: t("roleAdmin"),
    user: t("roleUser"),
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      message.warning(t("toastNameRequired"));
      return;
    }

    try {
      await updateProfile(name.trim());
      message.success(t("toastProfileSaved"));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastProfileFail")));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      message.warning(t("toastPasswordRequired"));
      return;
    }
    if (newPassword.length < 12) {
      message.warning(t("toastPasswordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      message.warning(t("toastPasswordMismatch"));
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      message.success(t("toastPasswordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastPasswordFail")));
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteToken(id);
      message.success(t("toastTokenDeleted"));
    } catch {
      message.error(t("toastTokenDeleteFail"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TAB_CONFIG.map(({ key, labelKey, icon: Icon }) => (
          <Button key={key} size="sm" variant={tab === key ? "primary" : "secondary"} onPress={() => setTab(key)}>
            <Icon size={14} />
            {t(labelKey)}
          </Button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="rounded-xl">
          <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <Card.Title className="text-base font-semibold m-0">{t("profileTitle")}</Card.Title>
          </Card.Header>
          <Card.Content className="px-5 py-4 flex flex-col gap-4">
            {profileLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="group relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-[var(--border-subtle)] cursor-pointer"
                  >
                    {avatarDataUrl ? (
                      <img src={avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                        {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={18} className="text-white" />
                    </div>
                  </button>
                  <div>
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-muted">JPG, PNG or GIF · max 2MB · stored locally</p>
                    <div className="flex gap-3 mt-1">
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                        {avatarDataUrl ? "Change photo" : "Upload photo"}
                      </button>
                      {avatarDataUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarDataUrl(null);
                            if (profile?.id) {
                              localStorage.removeItem(`avatar_${profile.id}`);
                              window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { src: null } }));
                            }
                            message.success("Photo removed");
                          }}
                          className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <TextField value={name} onChange={setName} isRequired>
                  <Label>{t("displayName")}</Label>
                  <InputGroup>
                    <InputGroup.Input placeholder={t("displayNamePlaceholder")} />
                  </InputGroup>
                </TextField>
                <TextField value={profile?.email ?? ""} isReadOnly>
                  <Label>{t("email")}</Label>
                  <InputGroup>
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">{t("role")}</span>
                  <Chip size="sm" variant="soft" color={profile?.role === "admin" ? "accent" : undefined}>
                    <Chip.Label>{ROLE(profile?.role, roleLabels)}</Chip.Label>
                  </Chip>
                </div>
                {profile?.createdAt && (
                  <p className="text-xs text-muted">{t("joinedAt", { date: dayjs(profile.createdAt).format("D MMM YYYY") })}</p>
                )}
                <Button variant="primary" isDisabled={profileUpdating} onPress={() => void handleSaveProfile()}>
                  {profileUpdating ? tCommon("saving") : t("saveProfile")}
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {tab === "security" && (
        <Card className="rounded-xl">
          <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <Card.Title className="text-base font-semibold m-0">{t("changePassword")}</Card.Title>
          </Card.Header>
          <Card.Content className="px-5 py-4 flex flex-col gap-4">
            <TextField value={currentPassword} onChange={setCurrentPassword} isRequired>
              <Label>{t("currentPassword")}</Label>
              <div className="relative w-full">
                <InputGroup className="w-full">
                  <InputGroup.Input type={showCurrentPw ? "text" : "password"} autoComplete="current-password" className="" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#858585] dark:hover:text-[#cccccc]"
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </InputGroup>

              </div>
            </TextField>
            <TextField value={newPassword} onChange={setNewPassword} isRequired>
              <Label>{t("newPassword")}</Label>
              <div className="relative w-full">
                <InputGroup className="w-full">
                  <InputGroup.Input type={showNewPw ? "text" : "password"} autoComplete="new-password" />
                </InputGroup >
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#858585] dark:hover:text-[#cccccc]"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </TextField>
            <TextField value={confirmPassword} onChange={setConfirmPassword} isRequired>
              <Label>{t("confirmPassword")}</Label>
              <div className="relative w-full">
                <InputGroup className="w-full">
                  <InputGroup.Input type={showConfirmPw ? "text" : "password"} autoComplete="new-password" />
                </InputGroup>
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#858585] dark:hover:text-[#cccccc]"
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </TextField>
            <Button variant="primary" isDisabled={isChanging} onPress={() => void handleChangePassword()}>
              {isChanging ? t("changingPassword") : t("changePasswordBtn")}
            </Button>
          </Card.Content>
        </Card>
      )}

      {tab === "integrations" && (
        <div className="flex flex-col gap-4 mb-4">
          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <div>
                <Card.Title className="text-base font-semibold m-0">{t("connectGithubTitle")}</Card.Title>
                <p className="text-xs text-muted mt-0.5">{t("connectGithubDesc")}</p>
              </div>
            </Card.Header>
            <Card.Content className="px-5 py-4 flex flex-col gap-3">
              {tokens.some((token) => token.provider === "oauth") ? (
                <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Github size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium">
                      {t("connectedAs", { login: tokens.find((token) => token.provider === "oauth")?.githubLogin ?? "" })}
                    </span>
                  </div>
                  <Chip size="sm" variant="soft" color="success">
                    <Chip.Label>{t("connected")}</Chip.Label>
                  </Chip>
                </div>
              ) : (
                <Button variant="primary" onPress={() => void connectGithub()}>
                  <Link2 size={14} />
                  {t("connectWithGithub")}
                </Button>
              )}
            </Card.Content>
          </Card>

          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <div>
                <Card.Title className="text-base font-semibold m-0">{t("githubAppTitle")}</Card.Title>
                <p className="text-xs text-muted mt-0.5">{t("githubAppDesc")}</p>
              </div>
            </Card.Header>
            <Card.Content className="px-5 py-4 flex flex-col gap-3">
              {!githubAppSetup?.configured ? (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{t("githubAppNotConfigured")}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : installations.length === 0 ? (
                <Button variant="primary" onPress={() => void installApp()}>
                  <Package size={14} />
                  {t("installApp")}
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  {installations.map((installation) => {
                    const isExpanded = expandedInstallationId === installation.installationId;

                    return (
                      <div key={installation.id} className="rounded-lg border border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => setExpandedInstallationId(isExpanded ? null : installation.installationId)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Package size={18} className="text-emerald-500" />
                            <span className="text-sm font-medium">
                              {installation.accountLogin ?? t("installation", { id: installation.installationId })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip size="sm" variant="soft" color={installation.suspendedAt ? "danger" : "success"}>
                              <Chip.Label>{installation.suspendedAt ? t("suspended") : t("active")}</Chip.Label>
                            </Chip>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>
                        {isExpanded && (
                          <InstallationRepositoryPanel installationId={installation.installationId} />
                        )}
                      </div>
                    );
                  })}
                  <Button size="sm" variant="secondary" onPress={() => void installApp()}>
                    <Plus size={14} />
                    {t("manageRepos")}
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>

          <Card className="rounded-xl">
            <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between w-full">
                <div>
                  <Card.Title className="text-base font-semibold m-0">GitHub Tokens</Card.Title>
                  <p className="text-xs text-muted mt-0.5">{t("tokensDesc")}</p>
                </div>
                <Button size="sm" variant="secondary" onPress={() => setAddTokenOpen(true)}>
                  <Plus size={14} />
                  {t("addToken")}
                </Button>
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              {tokensLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Github size={32} className="mx-auto text-muted mb-2" />
                  <p className="text-sm font-medium mb-1">{t("noTokens")}</p>
                  <p className="text-xs text-muted mb-4">{t("noTokensHint")}</p>
                  <Button size="sm" variant="primary" onPress={() => setAddTokenOpen(true)}>
                    <Plus size={14} />
                    {t("addToken")}
                  </Button>
                </div>
              ) : (
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="GitHub tokens">
                      <Table.Header>
                        <Table.Column isRowHeader>{t("colName")}</Table.Column>
                        <Table.Column>{t("colStatus")}</Table.Column>
                        <Table.Column>{t("colAdded")}</Table.Column>
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
                                <Chip.Label>{record.isActive ? t("tokenActive") : t("tokenInactive")}</Chip.Label>
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>{dayjs(record.createdAt).format("DD/MM/YYYY")}</Table.Cell>
                            <Table.Cell>
                              <ConfirmDialog
                                title={t("deleteTokenConfirm")}
                                confirmLabel={t("delete")}
                                confirmVariant="danger"
                                onConfirm={() => handleDeleteToken(record.id)}
                                trigger={
                                  <Button variant="ghost" isIconOnly size="sm" aria-label={t("deleteTokenAria")}>
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
        </div>
      )}

      <AddTokenModal open={addTokenOpen} onClose={() => setAddTokenOpen(false)} />
    </div>
  );
}

function InstallationRepositoryPanel({ installationId }: { installationId: string }) {
  const { repositories, isLoading, importRepository, isImporting } = useGithubAppInstallationRepositories(installationId);
  const [importingFullName, setImportingFullName] = useState<string | null>(null);
  const t = useTranslations("adminSettings");
  const tRepoTabs = useTranslations("repoTabs");

  const handleImport = async (fullName: string) => {
    setImportingFullName(fullName);
    try {
      await importRepository(fullName);
      message.success(t("toastImported", { name: fullName }));
    } catch (error) {
      message.error(getApiErrorMessage(error, t("toastImportFail", { name: fullName })));
    } finally {
      setImportingFullName(null);
    }
  };

  return (
    <div className="border-t border-[var(--border-subtle)] px-4 py-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : repositories.length === 0 ? (
        <p className="text-xs text-muted">{t("repoEmpty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {repositories.map((repo) => (
            <div key={repo.githubRepoId} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#2d2d2d] px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{repo.fullName}</span>
                <span className="text-xs text-muted">
                  {repo.private ? tRepoTabs("private") : tRepoTabs("public")} · {repo.defaultBranch}
                </span>
              </div>
              {repo.tracked ? (
                <Chip size="sm" variant="soft" color="success">
                  <Chip.Label className="flex items-center gap-1">
                    <Check size={12} />
                    {t("imported")}
                  </Chip.Label>
                </Chip>
              ) : (
                <Button size="sm" variant="secondary" isDisabled={isImporting} onPress={() => void handleImport(repo.fullName)}>
                  {isImporting && importingFullName === repo.fullName ? <Spinner size="sm" /> : <Download size={14} />}
                  {t("import")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ROLE(role: string | undefined, labels: Record<string, string>) {
  if (!role) return labels.user;
  return labels[role] ?? role;
}
