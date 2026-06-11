"use client";

import { useState } from "react";
import { Popover, ListBox, Spinner } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { message } from "@/lib/toast";
import { CHIP_DOT_CLASS, CHIP_SOFT_CLASS } from "./TestCases.config";

type ChipColor = keyof typeof CHIP_SOFT_CLASS | undefined;

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  color?: ChipColor;
};

const chipClass = (color?: ChipColor) => CHIP_SOFT_CLASS[color ?? "default"];
const dotClass = (color?: ChipColor) => CHIP_DOT_CLASS[color ?? "default"];

interface InlineChipPickerProps<T extends string> {
  value: T;
  options: ChipOption<T>[];
  ariaLabel: string;
  errorMsg: string;
  onChange: (value: T) => Promise<void>;
}

export function InlineChipPicker<T extends string>({
  value,
  options,
  ariaLabel,
  errorMsg,
  onChange,
}: InlineChipPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];

  const handleSelect = async (next: T) => {
    if (next === value) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      await onChange(next);
      setOpen(false);
    } catch {
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={ariaLabel}
        className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none outline-none cursor-pointer transition-[opacity,box-shadow] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${chipClass(current?.color)} ${loading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <span className="truncate">{current?.label}</span>
            <ChevronDown size={12} className="shrink-0 opacity-45" aria-hidden />
          </>
        )}
      </Popover.Trigger>
      <Popover.Content className="p-1 min-w-[9rem]" placement="bottom start">
        <Popover.Dialog className="p-0 outline-none">
          <ListBox
            selectionMode="single"
            selectedKeys={[value]}
            onSelectionChange={(keys) => {
              const key = keys === "all" ? null : Array.from(keys)[0];
              if (key) void handleSelect(String(key) as T);
            }}
            aria-label={ariaLabel}
          >
            {options.map((opt) => (
              <ListBox.Item key={opt.value} id={opt.value} textValue={opt.label}>
                <span className={`size-2 shrink-0 rounded-full ${dotClass(opt.color)}`} aria-hidden />
                <span className="text-sm">{opt.label}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export function configToChipOptions<T extends string>(
  config: Record<T, { label: string; color?: ChipColor }>,
): ChipOption<T>[] {
  return (Object.keys(config) as T[]).map((key) => ({
    value: key,
    label: config[key].label,
    color: config[key].color,
  }));
}
