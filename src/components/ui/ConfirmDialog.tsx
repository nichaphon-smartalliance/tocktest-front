"use client";

import { AlertDialog, Button } from "@heroui/react";
import { cloneElement, isValidElement, useState, type ReactNode } from "react";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  status?: "danger" | "accent" | "default";
  onConfirm: () => void | Promise<void>;
}

/** Controlled open state — trigger stays outside AlertDialog (avoids slot="trigger" inside Table.Row). */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  confirmVariant = "primary",
  status,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const iconStatus = status ?? (confirmVariant === "danger" ? "danger" : "accent");
  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger, {
        onPress: (...args: unknown[]) => {
          (trigger.props as { onPress?: (...a: unknown[]) => void }).onPress?.(...args);
          setOpen(true);
        },
      } as Record<string, unknown>)
    : (
        <span role="presentation" className="inline-flex" onClick={() => setOpen(true)}>
          {trigger}
        </span>
      );

  return (
    <>
      {triggerNode}
      <AlertDialog isOpen={open} onOpenChange={setOpen}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status={iconStatus} />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            {description && <AlertDialog.Body>{description}</AlertDialog.Body>}
            <AlertDialog.Footer>
              <Button slot="close" variant="secondary">
                {cancelLabel}
              </Button>
              <Button
                slot="close"
                variant={confirmVariant}
                onPress={() => {
                  void Promise.resolve(onConfirm());
                }}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
    </>
  );
}
