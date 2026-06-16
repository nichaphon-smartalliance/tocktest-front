"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Dropdown, Button } from "@heroui/react";
import { Languages } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isPending}
          aria-label="Change language"
          className="text-[var(--text-primary)]"
        >
          <Languages size={18} />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={[locale]}
          onAction={(key) => onChange(key as Locale)}
        >
          {locales.map((l) => (
            <Dropdown.Item key={l} id={l} textValue={localeNames[l]}>
              {localeNames[l]}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
