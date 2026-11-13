"use client";
import { useAdminFeedback } from "./notifications";
import { useEffect, useRef, useState } from "react";
import type { LibraryMedia } from "./MediaUpload";
import { adminRequest } from "./client";
import type { MediaUsage } from "@/features/media/server/deletion";
export function DeleteMediaDialog({
  media,
  onClose,
  onDeleted,
}: {
  media: LibraryMedia;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    pending = useRef(false);
  const [checking, setChecking] = useState(true),
    [usage, setUsage] = useState<MediaUsage[] | null>(null),
    [confirmation, setConfirmation] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useAdminFeedback("error");
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    let active = true;
    adminRequest<{ usage: MediaUsage[] }>(
      "/api/admin/media/delete?" + new URLSearchParams({ publicId: media.publicId }),
    )
      .then((data) => {
        if (active) setUsage(data.usage);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
      element.close();
    };
  }, [media.publicId, setError]);
  async function remove() {
    if (pending.current || checking || usage?.length !== 0 || confirmation !== media.name) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await adminRequest(
        "/api/admin/media/delete",
        { publicId: media.publicId, confirmation },
        "DELETE",
      );
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed. Please retry.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="admin-confirm-dialog"
      aria-labelledby="media-delete-heading"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending.current) onClose();
      }}
    >
      <h2 id="media-delete-heading">Delete this file?</h2>
      <p>
        <strong>{media.name}</strong>
      </p>
      {checking ? (
        <p role="status">Checking page, product and draft usage…</p>
      ) : usage?.length ? (
        <>
          <p>This file is still needed. Remove or replace it in these places first:</p>
          <ul>
            {usage.map((item, index) => (
              <li key={index}>{item.href ? <a href={item.href}>{item.label}</a> : item.label}</li>
            ))}
          </ul>
        </>
      ) : (
        usage && (
          <>
            <p>
              Deletes the original file from Cloudinary and its database registration. This cannot
              be undone.
            </p>
            <p>Saved page revisions keep their text; references to this file are removed.</p>
            <label>
              Type the file name to confirm
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
              />
            </label>
          </>
        )
      )}
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-delete-actions">
        <button
          type="button"
          className="admin-btn admin-outline"
          disabled={busy}
          onClick={onClose}
          autoFocus
        >
          {usage?.length ? "Close" : "Cancel"}
        </button>
        {usage?.length === 0 && (
          <button
            type="button"
            className="admin-btn admin-danger"
            disabled={busy || confirmation !== media.name}
            onClick={() => void remove()}
          >
            {busy ? "Deleting…" : "Delete permanently"}
          </button>
        )}
      </div>
    </dialog>
  );
}
