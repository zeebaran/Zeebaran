"use client";
import { useEffect, useRef } from "react";
export function Dialog({
  label,
  onClose,
  children,
  className = "",
  dismissOnBackdrop = false,
  trapFocus = false,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  dismissOnBackdrop?: boolean;
  trapFocus?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onKeyDown={(event) => {
        if (!trapFocus || event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
          ),
        ).filter((node) => node.getClientRects().length && node.tabIndex >= 0);
        if (!controls.length) return;
        event.preventDefault();
        const index = controls.indexOf(document.activeElement as HTMLElement);
        const next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next].focus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (!dismissOnBackdrop || event.target !== event.currentTarget) return;
        const r = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          onClose();
      }}
      className={className}
    >
      {children}
    </dialog>
  );
}
