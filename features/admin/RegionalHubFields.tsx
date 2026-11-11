"use client";
import { useState } from "react";
import { Plus, Trash2, Undo2, ChevronDown, MapPin } from "lucide-react";
import type { ContentValue } from "@/features/cms/model";
import { regionalHubs } from "@/features/contact/hubs-content";
import { regionalHubIssue, type RegionalHub, type HubLocation } from "@/features/cms/regional-hubs";
import styles from "./regional-hub-fields.module.css";
export function RegionalHubFields({
  content,
  onChange,
}: {
  content: ContentValue;
  onChange: (hubs: RegionalHub[]) => void;
}) {
  const hubs = regionalHubs(content),
    [editing, setEditing] = useState<string | null>(null),
    [removed, setRemoved] = useState<{ hub: RegionalHub; index: number } | null>(null),
    locationCount = hubs.reduce((sum, hub) => sum + hub.locations.length, 0);
  function update(id: string, patch: Partial<RegionalHub>) {
    onChange(hubs.map((hub) => (hub.id === id ? { ...hub, ...patch } : hub)));
  }
  function updateLocation(hub: RegionalHub, id: string, patch: Partial<HubLocation>) {
    update(hub.id, {
      locations: hub.locations.map((location) =>
        location.id === id ? { ...location, ...patch } : location,
      ),
    });
  }
  function add() {
    const id = "hub-" + crypto.randomUUID();
    onChange([
      ...hubs,
      {
        id,
        title: "New hub",
        place: "",
        body: "",
        facts: ["", ""],
        enabled: true,
        locations: [
          {
            id: "location-" + crypto.randomUUID(),
            name: "New hub",
            lat: null,
            lng: null,
            area: "kashmir",
            kind: "field",
            note: "",
            sub: "",
          },
        ],
      },
    ]);
    setEditing(id);
    requestAnimationFrame(() => document.getElementById(id + "-title")?.focus());
  }
  return (
    <div className={styles.editor}>
      <div className={styles.heading}>
        <div className="admin-tab-intro">
          <h2>Regional hubs.</h2>
          <p>
            Manage hub cards and their map pins together. Publish this page to update the website.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-primary"
          onClick={add}
          disabled={hubs.length >= 24 || locationCount >= 60}
        >
          <Plus size={16} /> Add hub
        </button>
      </div>
      {removed && (
        <div className={styles.undo} role="status">
          {removed.hub.title} removed from the draft.
          <button
            type="button"
            className="admin-text-button"
            disabled={hubs.length >= 24 || locationCount + removed.hub.locations.length > 60}
            onClick={() => {
              const next = [...hubs];
              next.splice(Math.min(removed.index, next.length), 0, removed.hub);
              onChange(next);
              setRemoved(null);
            }}
          >
            <Undo2 size={14} /> Undo
          </button>
        </div>
      )}
      <div className={styles.list}>
        {hubs.map((hub, index) => (
          <article key={hub.id} className={styles.card} data-hub-editor={hub.id}>
            <div className={styles.summary}>
              <div>
                <strong>{hub.title || "Unnamed hub"}</strong>
                <small>
                  {hub.enabled ? "Enabled" : "Disabled"} · {hub.locations.length}{" "}
                  {hub.locations.length === 1 ? "map pin" : "map pins"}
                </small>
              </div>
              <div className={styles.tools}>
                <button
                  type="button"
                  className="admin-btn admin-outline"
                  aria-pressed={hub.enabled}
                  onClick={() => update(hub.id, { enabled: !hub.enabled })}
                >
                  {hub.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-outline"
                  aria-expanded={editing === hub.id}
                  aria-controls={hub.id + "-details"}
                  onClick={() => setEditing(editing === hub.id ? null : hub.id)}
                >
                  Edit <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  className="admin-text-button"
                  aria-label={"Remove " + hub.title}
                  onClick={() => {
                    setRemoved({ hub, index });
                    onChange(hubs.filter((item) => item.id !== hub.id));
                    if (editing === hub.id) setEditing(null);
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
            {editing === hub.id && (
              <div id={hub.id + "-details"} className={styles.details}>
                <div className={styles.fields}>
                  <label>
                    Hub name
                    <input
                      id={hub.id + "-title"}
                      aria-label="Hub name"
                      maxLength={160}
                      value={hub.title}
                      onChange={(e) =>
                        update(hub.id, {
                          title: e.target.value,
                          ...(hub.locations.length === 1 && hub.locations[0].name === hub.title
                            ? { locations: [{ ...hub.locations[0], name: e.target.value }] }
                            : {}),
                        })
                      }
                    />
                  </label>
                  <label>
                    Area or address
                    <input
                      aria-label="Area or address"
                      maxLength={120}
                      value={hub.place}
                      onChange={(e) => update(hub.id, { place: e.target.value })}
                    />
                  </label>
                  <label className={styles.full}>
                    Description
                    <textarea
                      aria-label="Hub description"
                      rows={3}
                      maxLength={3000}
                      value={hub.body}
                      onChange={(e) => update(hub.id, { body: e.target.value })}
                    />
                  </label>
                  <label>
                    Key detail
                    <input
                      aria-label="Key detail"
                      maxLength={180}
                      value={hub.facts[0]}
                      placeholder="For example, capacity or altitude"
                      onChange={(e) => update(hub.id, { facts: [e.target.value, hub.facts[1]] })}
                    />
                  </label>
                  <label>
                    Service status
                    <input
                      aria-label="Service status"
                      maxLength={180}
                      value={hub.facts[1]}
                      placeholder="For example, response time"
                      onChange={(e) => update(hub.id, { facts: [hub.facts[0], e.target.value] })}
                    />
                  </label>
                </div>
                <div className={styles.locationHeading}>
                  <h3>
                    <MapPin size={16} /> Map locations
                  </h3>
                  <button
                    type="button"
                    className="admin-text-button"
                    disabled={hub.locations.length >= 8 || locationCount >= 60}
                    onClick={() =>
                      update(hub.id, {
                        locations: [
                          ...hub.locations,
                          {
                            id: "location-" + crypto.randomUUID(),
                            name: hub.title,
                            lat: null,
                            lng: null,
                            area: "kashmir",
                            kind: "field",
                            note: "",
                            sub: "",
                          },
                        ],
                      })
                    }
                  >
                    <Plus size={14} /> Add location
                  </button>
                </div>
                <p className={styles.note}>
                  Coordinates place each pin on the map. A hub can have more than one location.
                </p>
                {hub.locations.map((location, i) => (
                  <div
                    key={location.id}
                    className={styles.location}
                    data-hub-location={location.id}
                  >
                    <div className={styles.locationHeading}>
                      <strong>Location {i + 1}</strong>
                      <button
                        type="button"
                        className="admin-text-button"
                        aria-label={"Remove location " + (i + 1)}
                        onClick={() =>
                          update(hub.id, {
                            locations: hub.locations.filter((item) => item.id !== location.id),
                          })
                        }
                      >
                        <Trash2 size={13} /> Remove pin
                      </button>
                    </div>
                    <div className={styles.fields}>
                      <label>
                        Map label
                        <input
                          aria-label="Map label"
                          maxLength={120}
                          value={location.name}
                          onChange={(e) =>
                            updateLocation(hub, location.id, { name: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Region
                        <select
                          aria-label="Map region"
                          value={location.area}
                          onChange={(e) =>
                            updateLocation(hub, location.id, {
                              area: e.target.value as HubLocation["area"],
                            })
                          }
                        >
                          <option value="kashmir">Kashmir</option>
                          <option value="other">Outside Kashmir</option>
                        </select>
                      </label>
                      <label>
                        Latitude
                        <input
                          aria-label="Latitude"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="-90"
                          max="90"
                          value={location.lat ?? ""}
                          placeholder="34.0837"
                          onChange={(e) =>
                            updateLocation(hub, location.id, {
                              lat: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        Longitude
                        <input
                          aria-label="Longitude"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="-180"
                          max="180"
                          value={location.lng ?? ""}
                          placeholder="74.7973"
                          onChange={(e) =>
                            updateLocation(hub, location.id, {
                              lng: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        Location type
                        <select
                          aria-label="Location type"
                          value={location.kind}
                          onChange={(e) =>
                            updateLocation(hub, location.id, {
                              kind: e.target.value as HubLocation["kind"],
                            })
                          }
                        >
                          <option value="hq">Head office</option>
                          <option value="cold">Storage or logistics</option>
                          <option value="field">Field station</option>
                          <option value="office">Office</option>
                        </select>
                      </label>
                      <label>
                        Short map caption <small>(optional)</small>
                        <input
                          aria-label="Short map caption"
                          maxLength={160}
                          value={location.sub}
                          onChange={(e) =>
                            updateLocation(hub, location.id, { sub: e.target.value })
                          }
                        />
                      </label>
                      <label className={styles.full}>
                        Map details <small>(optional; uses the hub description if empty)</small>
                        <textarea
                          aria-label="Map details"
                          rows={2}
                          maxLength={800}
                          value={location.note}
                          onChange={(e) =>
                            updateLocation(hub, location.id, { note: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
                {regionalHubIssue([hub]) && (
                  <p className={styles.validation}>{regionalHubIssue([hub])}</p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      {!hubs.length && <p className="admin-empty">No hubs in this draft. Add a hub when ready.</p>}
      <p className={styles.note}>
        Disabled hubs stay in the admin panel and disappear from the public cards and both maps
        after publishing.
      </p>
    </div>
  );
}
