"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { adminRequest } from "@/features/admin/client";
import { notifyAdmin } from "@/features/admin/notifications";
import { youtubeUrl } from "@/features/cms/video";
import { emptyPodcast, newestEpisodes, type PodcastContent, type PodcastEpisode } from "./model";
import type { ContentValue } from "@/features/cms/model";
import styles from "./podcast-admin.module.css";
type Metadata = { url: string; title: string; channel: string };
export function PodcastFields({
  content,
  onChange,
}: {
  content: ContentValue;
  onChange: (value: PodcastContent) => void;
}) {
  const value = content.podcast || emptyPodcast();
  const latest = useRef(value),
    alive = useRef(true),
    pending = useRef(new Map<string, string>()),
    cache = useRef(new Map<string, Metadata>());
  latest.current = value;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({}),
    [loading, setLoading] = useState<Record<string, boolean>>({});
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  function patch(id: string, changes: Partial<PodcastEpisode>) {
    const current = latest.current;
    const next = {
      ...current,
      episodes: current.episodes.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    };
    latest.current = next;
    onChange(next);
  }
  async function titleFromVideo(id: string, link: string, replace = false) {
    const url = youtubeUrl(link);
    if (!url || pending.current.get(id) === url) return;
    const original = latest.current.episodes.find((e) => e.id === id);
    if (!original) return;
    const originalTitle = original.title;
    pending.current.set(id, url);
    setLoading((old) => ({ ...old, [id]: true }));
    setStatus((old) => ({ ...old, [id]: "Reading YouTube title…" }));
    try {
      const data =
        cache.current.get(url) ||
        (await adminRequest<Metadata>("/api/admin/podcast/metadata", { url }));
      cache.current.set(url, data);
      if (!alive.current || pending.current.get(id) !== url) return;
      const current = latest.current.episodes.find((e) => e.id === id);
      if (!current || youtubeUrl(current.url) !== url) return;
      if (current.title === originalTitle && (replace || !current.title.trim())) {
        patch(id, { title: data.title });
        setStatus((old) => ({
          ...old,
          [id]: "Title imported from " + (data.channel || "YouTube") + ". You can edit it below.",
        }));
      } else
        setStatus((old) => ({
          ...old,
          [id]: "Your title is preserved. Use ‘Use YouTube title’ to replace it.",
        }));
    } catch (e) {
      if (alive.current && pending.current.get(id) === url)
        setStatus((old) => ({
          ...old,
          [id]: e instanceof Error ? e.message : "Enter the title manually.",
        }));
    } finally {
      if (alive.current && pending.current.get(id) === url) {
        pending.current.delete(id);
        setLoading((old) => ({ ...old, [id]: false }));
      }
    }
  }
  return (
    <div className={styles.editor}>
      <div className={styles.heading}>
        <div>
          <h2>The conversation library.</h2>
          <p>
            Paste a YouTube link. The title is imported automatically; every detail stays editable.
            Save a draft, then publish when ready.
          </p>
        </div>
        <button
          className="admin-btn admin-primary"
          disabled={value.episodes.length >= 80}
          onClick={() => {
            const id = crypto.randomUUID();
            setExpanded(id);
            onChange({
              ...value,
              episodes: [
                ...value.episodes,
                {
                  id,
                  url: "",
                  title: "",
                  description: "",
                  guest: "",
                  topic: "",
                  enabled: true,
                  addedAt: Date.now(),
                },
              ],
            });
          }}
        >
          <Plus size={15} />
          Add episode
        </button>
      </div>
      <label className={styles.channel}>
        YouTube channel
        <input
          value={value.channelUrl}
          maxLength={500}
          onChange={(e) => onChange({ ...value, channelUrl: e.target.value })}
        />
      </label>
      {!value.episodes.length && (
        <div className={styles.empty}>
          Your first conversation belongs here. Add an episode when its YouTube video is ready.
        </div>
      )}
      {newestEpisodes(value.episodes).map((episode, index) => (
        <details
          key={episode.id}
          className={styles.card}
          open={expanded === episode.id}
          onToggle={(e) => {
            if (e.currentTarget.open) setExpanded(episode.id);
            else if (expanded === episode.id) setExpanded(null);
          }}
          data-podcast-editor={episode.id}
        >
          <summary>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{episode.title || "New conversation"}</strong>
            <small>{episode.enabled ? "Visible after publish" : "Hidden"}</small>
          </summary>
          {expanded === episode.id && (
            <div className={styles.body}>
              <div className={styles.actions}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={episode.enabled}
                    onChange={(e) => patch(episode.id, { enabled: e.target.checked })}
                  />
                  Show episode
                </label>
                <button
                  className="admin-text-button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this episode from the draft? Publish to remove it from the website. The original YouTube video stays on YouTube.",
                      )
                    ) {
                      onChange({
                        ...value,
                        episodes: value.episodes.filter((e) => e.id !== episode.id),
                      });
                      notifyAdmin("Episode removed from the draft. Publish to update the website.");
                    }
                  }}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
              <label>
                YouTube video link
                <input
                  value={episode.url}
                  maxLength={2000}
                  placeholder="https://www.youtube.com/watch?v=…"
                  onChange={(e) => patch(episode.id, { url: e.target.value })}
                  onPaste={(e) => {
                    const link = e.clipboardData.getData("text").trim();
                    if (youtubeUrl(link)) {
                      e.preventDefault();
                      patch(episode.id, { url: link });
                      void titleFromVideo(episode.id, link);
                    }
                  }}
                  onBlur={() => {
                    if (!episode.title.trim()) void titleFromVideo(episode.id, episode.url);
                  }}
                />
              </label>
              <div className={styles.import}>
                <button
                  className="admin-btn admin-outline"
                  disabled={!youtubeUrl(episode.url) || loading[episode.id]}
                  onClick={() => void titleFromVideo(episode.id, episode.url, true)}
                >
                  <RefreshCw size={13} />
                  {loading[episode.id] ? "Reading title…" : "Use YouTube title"}
                </button>
                <p role="status">{status[episode.id]}</p>
              </div>
              <label>
                Episode title
                <input
                  value={episode.title}
                  maxLength={200}
                  onChange={(e) => patch(episode.id, { title: e.target.value })}
                />
              </label>
              <div className={styles.columns}>
                <label>
                  Guest / expertise <small>(optional)</small>
                  <input
                    value={episode.guest}
                    maxLength={200}
                    placeholder="Guest name and field of expertise"
                    onChange={(e) => patch(episode.id, { guest: e.target.value })}
                  />
                </label>
                <label>
                  Topic <small>(optional)</small>
                  <input
                    value={episode.topic}
                    maxLength={80}
                    placeholder="For example: Orchard science"
                    onChange={(e) => patch(episode.id, { topic: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Episode summary <small>(optional)</small>
                <textarea
                  value={episode.description}
                  rows={4}
                  maxLength={4000}
                  placeholder="What questions does this conversation explore?"
                  onChange={(e) => patch(episode.id, { description: e.target.value })}
                />
              </label>
            </div>
          )}
        </details>
      ))}
    </div>
  );
}
