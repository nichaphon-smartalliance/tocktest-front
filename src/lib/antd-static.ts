"use client";

/**
 * antd-static.ts
 *
 * antd v5 static functions (message.success etc.) cannot consume
 * dynamic theme context unless called inside <App>.
 *
 * This module provides a drop-in replacement: same API, but backed
 * by the context-aware instance captured by <AntdBridge> (rendered
 * inside <App> in ThemeProvider).
 *
 * Usage in components:
 *   import { message } from "@/lib/antd-static";   // ← instead of "antd"
 *   message.success("done");
 */

import type { MessageInstance } from "antd/es/message/interface";
import { App } from "antd";
import { useEffect } from "react";

// Module-level singleton — set once when AntdBridge mounts
let _msg: MessageInstance | null = null;

export function setStaticMessage(api: MessageInstance) {
  _msg = api;
}

/** Drop-in replacement for antd's static `message` object */
export const message = {
  success: (content: React.ReactNode, duration?: number) =>
    _msg?.success(content, duration),
  error: (content: React.ReactNode, duration?: number) =>
    _msg?.error(content, duration),
  warning: (content: React.ReactNode, duration?: number) =>
    _msg?.warning(content, duration),
  info: (content: React.ReactNode, duration?: number) =>
    _msg?.info(content, duration),
  loading: (content: React.ReactNode, duration?: number) =>
    _msg?.loading(content, duration),
};

/**
 * Renders nothing — just wires up the context-aware message API.
 * Must be rendered as a child of antd's <App> component.
 */
export function AntdBridge() {
  const { message: msg } = App.useApp();
  useEffect(() => {
    setStaticMessage(msg);
  }, [msg]);
  return null;
}
