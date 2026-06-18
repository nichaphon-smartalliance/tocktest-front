"use client";

import { Dropdown } from "@heroui/react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";
import { updateUserSettings } from "@/services/user.service";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("adminSettings");
  const [isPending, startTransition] = useTransition();

  const onChange = (next: Locale) => {
    if (next === locale) return;

    startTransition(async () => {
      await updateUserSettings({ preferredLanguage: next }).catch(() => null);
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div
          aria-label={t("language")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/8 transition-colors ${
            isPending ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Languages size={18} />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={[locale]}
          onAction={(key) => onChange(key as Locale)}
        >
          {locales.map((item) => (
            <Dropdown.Item key={item} id={item} textValue={localeNames[item]}>
              {localeNames[item]}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
