"use client";
import { useCallback, useState } from "react";
export type AdminNotification = {
  id: number;
  message: string;
  tone: "success" | "error";
};
export const notificationEvent = "zeebaran:admin-notification";
let sequence = 0;
/** Feedback is local UI state: it never writes to the database or storage. */
export function notifyAdmin(message: string, tone: AdminNotification["tone"] = "success") {
  if (!message.trim() || typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AdminNotification>(notificationEvent, {
      detail: { id: ++sequence, message, tone },
    }),
  );
}
/** Retain contextual feedback while also making completed actions visible from any scroll position. */
export function useAdminFeedback(tone: AdminNotification["tone"]) {
  const [message, setMessage] = useState("");
  const report = useCallback(
    (value: string) => {
      setMessage(value);
      if (value) notifyAdmin(value, tone);
    },
    [tone],
  );
  return [message, report] as const;
}
