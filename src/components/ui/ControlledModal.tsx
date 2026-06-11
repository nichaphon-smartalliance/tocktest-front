"use client";

import { Modal, useOverlayState } from "@heroui/react";
import type { ReactNode } from "react";

interface ControlledModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Modal synced to parent `open`; unmounts when closed to avoid ghost overlays. */
export function ControlledModal({ open, onClose, children }: ControlledModalProps) {
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose();
    },
  });

  if (!open) return null;

  return <Modal state={state}>{children}</Modal>;
}
