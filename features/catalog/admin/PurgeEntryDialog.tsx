"use client";
import { useAdminFeedback } from "@/features/admin/notifications";
import { useEffect, useRef, useState } from "react";
import { adminRequest, AdminRequestError } from "@/features/admin/client";
import type { CatalogIndexEntry } from "../model";
import type { MediaIdentity } from "@/features/media/references";
export function PurgeEntryDialog({
  entry,
  onClose,
  onDeleted,
}: {
  entry: CatalogIndexEntry;
  onClose: () => void;
  onDeleted: (notice: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    pending = useRef(false);
  const [confirmation, setConfirmation] = useState(""),
    [cleanup, setCleanup] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useAdminFeedback("error");
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  async function remove() {
    if (pending.current || confirmation !== entry.draft.name) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await adminRequest<{ media: MediaIdentity[] }>(
        "/api/admin/catalog/" + entry.id,
        { revision: entry.revision, confirmation },
        "DELETE",
      );
      let deleted = 0,
        retained = 0,
        incomplete = 0;
      // Each file has a separate retryable request, so a large gallery never exceeds one request's deadline.
      if (cleanup)
        for (const media of result.media) {
          try {
            const library = await adminRequest<{ usage: unknown[]; name: string }>(
              "/api/admin/media/delete?" + new URLSearchParams({ publicId: media.publicId }),
            );
            if (library.usage.length) {
              retained++;
              continue;
            }
            await adminRequest(
              "/api/admin/media/delete",
              { publicId: media.publicId, confirmation: library.name },
              "DELETE",
            );
            deleted++;
          } catch (error) {
            if (error instanceof AdminRequestError && error.status === 404) continue;
            if (error instanceof AdminRequestError && error.status === 409) retained++;
            else incomplete++;
          }
        }
      onDeleted(
        "Entry permanently deleted from Firebase." +
          (deleted ? ` ${deleted} unused file(s) deleted from Cloudinary.` : "") +
          (retained ? ` ${retained} shared or original file(s) kept.` : "") +
          (incomplete ? ` ${incomplete} file(s) still need cleanup in Media library.` : "") +
          (!cleanup && result.media.length ? " Photos remain in Media library." : ""),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Deletion failed. Retry to finish cleanup.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="admin-confirm-dialog"
      aria-labelledby="purge-entry-heading"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending.current) onClose();
      }}
    >
      <h2 id="purge-entry-heading">Delete permanently?</h2>
      <p>
        Removes <strong>{entry.draft.name}</strong>, its saved details and catalog history from
        Firebase. This cannot be undone.
      </p>
      <label className="admin-cleanup-choice">
        <input
          type="checkbox"
          checked={cleanup}
          onChange={(event) => setCleanup(event.target.checked)}
          disabled={busy}
        />
        Also delete unused photos from Cloudinary. Shared and original website photos are kept.
      </label>
      <label>
        Type the entry name to confirm
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          disabled={busy}
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-delete-actions">
        <button
          type="button"
          className="admin-btn admin-outline"
          disabled={busy}
          onClick={onClose}
          autoFocus
        >
          Cancel
        </button>
        <button
          type="button"
          className="admin-btn admin-danger"
          disabled={busy || confirmation !== entry.draft.name}
          onClick={() => void remove()}
        >
          {busy ? "Deleting and cleaning up…" : "Delete permanently"}
        </button>
      </div>
    </dialog>
  );
}
