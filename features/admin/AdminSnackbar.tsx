"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle, X } from "lucide-react";
import { notificationEvent, type AdminNotification } from "./notifications";
import styles from "./admin-snackbar.module.css";
export function AdminSnackbar() {
  const [current, setCurrent] = useState<AdminNotification | null>(null);
  const [paused, setPaused] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const latest = useRef<{ message: string; tone: string; at: number } | null>(null);
  useEffect(() => {
    const receive = (event: Event) => {
      const item = (event as CustomEvent<AdminNotification>).detail;
      if (!item || typeof item.message !== "string" || !["success", "error"].includes(item.tone))
        return;
      const previous = latest.current,
        at = Date.now();
      // A shared operation can update both its dialog and parent. Announce it once.
      if (
        previous?.message === item.message &&
        previous.tone === item.tone &&
        at - previous.at < 500
      )
        return;
      latest.current = { message: item.message, tone: item.tone, at };
      setPaused(false);
      setCurrent(item);
    };
    window.addEventListener(notificationEvent, receive);
    return () => window.removeEventListener(notificationEvent, receive);
  }, []);
  useEffect(() => {
    if (!current || paused) return;
    const timer = window.setTimeout(
      () => setCurrent((old) => (old?.id === current.id ? null : old)),
      current.tone === "error" ? 10000 : 6000,
    );
    return () => window.clearTimeout(timer);
  }, [current, paused]);
  useEffect(() => {
    if (!current) return;
    const dialog = Array.from(document.querySelectorAll<HTMLDialogElement>("dialog[open]")).at(-1);
    let active = true;
    // Resolve after the action's commit, when a successful save may have closed its dialog.
    queueMicrotask(() => {
      if (active) setContainer(dialog?.isConnected && dialog.open ? dialog : document.body);
    });
    if (!dialog)
      return () => {
        active = false;
      };
    // Modal siblings are inert. Portal into the active dialog for keyboard and pointer access.
    const observer = new MutationObserver(() => {
      if (!dialog.isConnected || !dialog.open) setContainer(document.body);
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    // Watch only the ancestor chain, not every mutation in a large page preview.
    for (let parent = dialog.parentElement; parent; parent = parent.parentElement)
      observer.observe(parent, { childList: true });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [current]);
  useEffect(() => {
    const element = host.current;
    if (!element?.isConnected || !current) return;
    // The browser's top layer keeps feedback visible above native modal dialogs.
    element.showPopover?.();
    return () => {
      if (element.isConnected) element.hidePopover?.();
    };
  }, [current, container]);
  return current && container
    ? createPortal(
        <div ref={host} popover="manual" className={styles.host} data-admin-snackbar>
          {current && (
            <div
              key={current.id}
              className={styles.card}
              data-tone={current.tone}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
              }}
            >
              <span className={styles.icon} aria-hidden="true">
                {current.tone === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
              </span>
              <p role={current.tone === "error" ? "alert" : "status"} aria-atomic="true">
                {current.message}
              </p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => {
                  setPaused(false);
                  setCurrent((old) => (old?.id === current.id ? null : old));
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>,
        container,
      )
    : null;
}
