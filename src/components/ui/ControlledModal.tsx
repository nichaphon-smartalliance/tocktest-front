"use client";

import { Modal, useOverlayState } from "@heroui/react";
import { useCallback, type ReactNode } from "react";

interface ControlledModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Controlled modal — stays mounted while closing so exit transitions can finish. */
export function ControlledModal({ open, onClose, children }: ControlledModalProps) {
  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) onClose();
    },
    [onClose],
  );

  const state = useOverlayState({ isOpen: open, onOpenChange });

  return <Modal state={state}>{children}</Modal>;
}
