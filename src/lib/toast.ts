import { Toast } from "@heroui/react";
import type { ReactNode } from "react";

function toMessage(content: ReactNode): string {
  return typeof content === "string" ? content : String(content);
}

/** Drop-in replacement for antd's static `message` object */
export const message = {
  success: (content: ReactNode) => Toast.toast.success(toMessage(content)),
  error: (content: ReactNode) => Toast.toast.danger(toMessage(content)),
  warning: (content: ReactNode) => Toast.toast.warning(toMessage(content)),
  info: (content: ReactNode) => Toast.toast.info(toMessage(content)),
};
