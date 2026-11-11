"use client";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  mediaCategories,
  categoryForEditor,
  type MediaCategory,
} from "@/features/media/categories";
import { UploadCloud, Film, ImagePlus } from "lucide-react";
import { adminRequest } from "./client";
export type LibraryMedia = {
  publicId: string;
  src: string;
  resourceType: "image" | "video";
  width: number;
  height: number;
  bytes: number;
  alt: string;
  name: string;
  category?: string;
};
export function MediaUpload({
  kind = "image",
  category: initialCategory,
  onUploaded,
}: {
  kind?: "image" | "video";
  category?: MediaCategory;
  onUploaded: (m: LibraryMedia) => void;
}) {
  const pathname = usePathname();
  const [category, setCategory] = useState<MediaCategory>(
    () => initialCategory || (kind === "video" ? "videos" : categoryForEditor(pathname)),
  );
  const input = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(""),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function upload(file: File) {
    setError("");
    if (file.size > (kind === "image" ? 10 : 100) * 1024 * 1024) {
      setError(kind === "image" ? "Choose an image under 10 MB." : "Choose a video under 100 MB.");
      return;
    }
    if (!(kind === "image" ? /\.(jpe?g|png|webp|avif)$/i : /\.(mp4|webm|mov)$/i).test(file.name)) {
      setError("This file format is not supported.");
      return;
    }
    if (kind === "image" && !alt.trim()) {
      setError("Describe the image before uploading it.");
      return;
    }
    setPending(true);
    try {
      const signed = await adminRequest<Record<string, string>>("/api/admin/media/sign", {
        kind,
        category: kind === "video" ? "videos" : category,
        name: file.name,
      });
      const body = new FormData();
      for (const [key, value] of Object.entries(signed))
        if (!["url", "kind"].includes(key)) body.append(key, String(value));
      body.append("file", file);
      const response = await fetch(signed.url, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(300000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error("Cloudinary could not receive the upload. Please retry.");
      const verified = await adminRequest<{ media: LibraryMedia }>("/api/admin/media", {
        publicId: result.public_id,
        kind,
        alt: alt.trim(),
        name: file.name,
      });
      onUploaded(verified.media);
      setAlt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please retry.");
    } finally {
      setPending(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="admin-upload">
      <div className="admin-upload-icon">
        {kind === "image" ? <ImagePlus size={23} /> : <Film size={23} />}
      </div>
      <h4>
        {kind === "image" ? "Bring a new image to the story." : "Make room for a field film."}
      </h4>
      <p>
        {kind === "image"
          ? "JPG, PNG, WebP or AVIF · up to 10 MB"
          : "MP4, WebM or MOV · up to 100 MB"}
      </p>
      <label>
        Save in
        <select
          value={kind === "video" ? "videos" : category}
          disabled={pending || kind === "video"}
          onChange={(event) => setCategory(event.target.value as MediaCategory)}
        >
          {mediaCategories.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {kind === "image" && (
        <label>
          Alternative text
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            disabled={pending}
            placeholder="Describe what the photograph shows"
            maxLength={300}
          />
        </label>
      )}
      <input
        ref={input}
        aria-label={"Upload " + kind}
        type="file"
        accept={
          kind === "image"
            ? "image/jpeg,image/png,image/webp,image/avif"
            : "video/mp4,video/webm,video/quicktime"
        }
        className="sr-only"
        disabled={pending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <button
        className="admin-btn admin-outline"
        disabled={pending}
        onClick={() => input.current?.click()}
      >
        <UploadCloud size={16} />
        {pending ? "Uploading and verifying…" : "Choose " + kind}
      </button>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <small>Uploads are signed by the server and verified before entering the library.</small>
    </div>
  );
}
