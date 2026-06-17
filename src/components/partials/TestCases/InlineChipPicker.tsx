"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { ListBox, Popover, Spinner } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { message } from "@/lib/toast";
import { CHIP_DOT_CLASS, CHIP_SOFT_CLASS } from "./TestCases.config";

type ChipColor = keyof typeof CHIP_SOFT_CLASS | undefined;

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  color?: ChipColor;
};

export type ChipConfigOption<T extends string> = {
  value: T;
  labelKey: string;
  color?: ChipColor;
};

const chipClass = (color?: ChipColor) => CHIP_SOFT_CLASS[color ?? "default"];
const dotClass = (color?: ChipColor) => CHIP_DOT_CLASS[color ?? "default"];

interface InlineChipPickerProps<T extends string> {
  value: T;
  options: ChipOption<T>[];
  ariaLabel: string;
  errorMsg: string;
  chipWidth: string;
  onChange: (value: T) => Promise<void>;
}

function InlineChipPickerComponent<T extends string>({
  value,
  options,
  ariaLabel,
  errorMsg,
  chipWidth,
  onChange,
}: InlineChipPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!loading) setDisplayValue(value);
  }, [value, loading]);

  const current = useMemo(
    () => options.find((option) => option.value === displayValue) ?? options[0],
    [displayValue, options],
  );

  const handleSelect = async (next: T) => {
    if (next === displayValue) {
      setOpen(false);
      return;
    }

    const previous = displayValue;
    setDisplayValue(next);
    setOpen(false);
    setLoading(true);

    try {
      await onChange(next);
    } catch {
      setDisplayValue(previous);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={ariaLabel}
        className={`inline-flex ${chipWidth} h-7 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium leading-none outline-none cursor-pointer transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${chipClass(current?.color)} ${loading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-center">{current?.label}</span>
            <ChevronDown size={12} className="shrink-0 opacity-45" aria-hidden />
          </>
        )}
      </Popover.Trigger>
      <Popover.Content className="p-1 min-w-[9rem]" placement="bottom start">
        <Popover.Dialog className="p-0 outline-none">
          <ListBox
            selectionMode="single"
            selectedKeys={[displayValue]}
            onSelectionChange={(keys) => {
              const key = keys === "all" ? null : Array.from(keys)[0];
              if (key) void handleSelect(String(key) as T);
            }}
            aria-label={ariaLabel}
          >
            {options.map((option) => (
              <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
                <span className={`size-2 shrink-0 rounded-full ${dotClass(option.color)}`} aria-hidden />
                <span className="text-sm">{option.label}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export const InlineChipPicker = memo(InlineChipPickerComponent) as typeof InlineChipPickerComponent;

export function configToChipOptions<T extends string>(
  config: Record<T, { labelKey: string; color?: ChipColor }>,
): ChipConfigOption<T>[] {
  return (Object.keys(config) as T[]).map((key) => ({
    value: key,
    labelKey: config[key].labelKey,
    color: config[key].color,
  }));
}

export const CHIP_PICKER_WIDTH = {
  status: "w-[6.75rem]",
  priority: "w-[4.25rem]",
  type: "w-[7.25rem]",
} as const;
