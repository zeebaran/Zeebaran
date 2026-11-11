"use client";
import { useState, useSyncExternalStore } from "react";
import { nodes as originalNodes } from "./map-content";
import { useRegionalHubs } from "@/features/cms/Content";
import { mappedHubs } from "@/features/cms/regional-hubs";
const subscribe = () => () => {},
  ready = () => true,
  fallback = () => false;
const originalIds = ["baramulla", "srinagar", "lassipora", "achabal", "delhi"];
export function RegionalHubReference() {
  const locations = mappedHubs(useRegionalHubs()),
    selected = locations.find((location) => location.kind === "hq") || locations[0];
  return (
    <span>
      {selected
        ? `${Math.abs(selected.lat).toFixed(4)}° ${selected.lat < 0 ? "S" : "N"}, ${Math.abs(selected.lng).toFixed(4)}° ${selected.lng < 0 ? "W" : "E"}`
        : "Regional network"}
    </span>
  );
}
export function RegionMap() {
  const hydrated = useSyncExternalStore(subscribe, ready, fallback),
    locations = mappedHubs(useRegionalHubs()),
    [selectedId, select] = useState("srinagar"),
    selected =
      locations.find((location) => location.id === selectedId) ||
      locations.find((location) => location.kind === "hq") ||
      locations[0];
  if (!selected)
    return (
      <p className="py-8 text-center text-xs text-muted" data-regional-hubs>
        Regional locations will appear here when available.
      </p>
    );
  const visible =
      locations.length > 8
        ? locations.filter((location) => location.id === selected.id || location.kind === "hq")
        : locations,
    legacy = visible.every((location) => originalIds.includes(location.id)),
    nodes = visible.map((location, i) => {
      const original = originalNodes[originalIds.indexOf(location.id)],
        x = visible.length === 1 ? 260 : 70 + (i * 380) / (visible.length - 1),
        y = visible.length === 1 ? 135 : 60 + (i * 155) / (visible.length - 1);
      return {
        ...location,
        ...(legacy
          ? { x: original.x, y: original.y, tx: original.tx, ty: original.ty }
          : { x, y, tx: x > 350 ? x - 100 : x + 13, ty: y - 9 }),
      };
    }),
    route = nodes.map((node, index) => `${index ? "L" : "M"}${node.x} ${node.y}`).join(" "),
    chosenIndex = nodes.findIndex((node) => node.id === selected.id);
  return (
    <div className="w-full max-w-lg" data-regional-hubs>
      <div className="relative">
        <svg
          role="img"
          aria-label="Stylised corridor connecting active Zeebaran regional hubs"
          className="h-auto w-full max-w-lg"
          fill="none"
          viewBox="0 0 520 266"
        >
          <path
            d="M20 180 Q80 130 140 150 T260 110 T380 90 T500 130"
            stroke="#D8D3C3"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <path
            d="M40 220 Q120 180 200 190 T320 160 T440 170 T510 200"
            stroke="#E5E0D0"
            strokeWidth="1"
          />
          <path
            d="M10 120 Q90 60 180 80 T300 40 T420 50 T510 70"
            stroke="#E2DDD0"
            strokeWidth="1.2"
          />
          <path
            d={route}
            stroke="#06642D"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeOpacity=".7"
            strokeWidth="2.5"
          />
          <path
            key={selected.id}
            className="corridor-trace"
            aria-hidden="true"
            pathLength="1"
            d={nodes
              .slice(0, chosenIndex + 1)
              .map((node, i) => `${i ? "L" : "M"}${node.x} ${node.y}`)
              .join(" ")}
            stroke="#06642d"
            strokeWidth="2.5"
          />
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                className={node.kind === "hq" || node.kind === "cold" ? "animate-pulse" : undefined}
                cx={node.x}
                cy={node.y}
                r={node.kind === "hq" ? 9 : 7}
                fill={
                  node.kind === "hq" ? "#FE6901" : node.kind === "field" ? "#8CC63F" : "#06642D"
                }
                fillOpacity={node.kind === "hq" ? 0.25 : 0.3}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.kind === "hq" ? 6 : 5}
                fill={
                  node.kind === "hq" ? "#FE6901" : node.kind === "office" ? "#123B25" : "#06642D"
                }
              />
              <circle cx={node.x} cy={node.y} r="2" fill="#fff" />
              {node.id === selected.id && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  fill="none"
                  stroke="#06642d"
                  strokeWidth="1.5"
                />
              )}
              <text x={node.tx} y={node.ty} fill="#123B25" fontSize="11" fontWeight="600">
                {node.name.length > 23 ? node.name.slice(0, 22) + "…" : node.name}
              </text>
              <text x={node.tx} y={node.ty + 12} fill="#4a5a50" fontSize="9">
                {node.sub.length > 28 ? node.sub.slice(0, 27) + "…" : node.sub}
              </text>
            </g>
          ))}
        </svg>
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            aria-label={"Show " + node.name}
            disabled={!hydrated}
            aria-pressed={selected.id === node.id}
            onClick={() => select(node.id)}
            style={{ left: (node.x / 520) * 100 + "%", top: (node.y / 266) * 100 + "%" }}
            className="absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
        ))}
      </div>
      {locations.length > 8 && (
        <label className="mt-3 block text-xs text-forest">
          Regional location
          <select
            className="mt-2 w-full rounded-lg border border-line bg-white p-2"
            value={selected.id}
            onChange={(event) => select(event.target.value)}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="hub-details mt-2 border-t border-line pt-3 lg:pt-2" aria-live="polite">
        <strong className="text-small text-forest">{selected.name}</strong>
        <p className="mt-0.5 text-xs text-muted">{selected.note}</p>
      </div>
    </div>
  );
}
