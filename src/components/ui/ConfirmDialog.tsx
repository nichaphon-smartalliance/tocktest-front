"use client";

import { AlertDialog, Button } from "@heroui/react";
import type { ReactNode } from "react";

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
  const iconStatus = status ?? (confirmVariant === "danger" ? "danger" : "accent");

  return (
    <AlertDialog>
      <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
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
  );
}
