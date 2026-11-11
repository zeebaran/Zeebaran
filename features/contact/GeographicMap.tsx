"use client";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { useRegionalHubs } from "@/features/cms/Content";
import { mappedHubs, type MappedHub } from "@/features/cms/regional-hubs";
import "leaflet/dist/leaflet.css";
import "./geographic-map.css";
function fitOverview(map: Leaflet.Map, locations: MappedHub[], all: boolean) {
  const valley = locations.filter((location) => location.area === "kashmir"),
    points = !all && valley.length ? valley : locations;
  if (!points.length) return;
  map.fitBounds(
    points.map((p) => [p.lat, p.lng] as [number, number]),
    { paddingTopLeft: [26, 46], paddingBottomRight: [52, 24], maxZoom: 11, animate: false },
  );
}
export function GeographicMap() {
  const locations = mappedHubs(useRegionalHubs()),
    signature = JSON.stringify(locations),
    hasLocations = locations.length > 0,
    [selectedId, setSelectedId] = useState("srinagar"),
    selected =
      locations.find((location) => location.id === selectedId) ||
      locations.find((location) => location.kind === "hq") ||
      locations[0],
    container = useRef<HTMLDivElement>(null),
    map = useRef<Leaflet.Map | null>(null),
    api = useRef<typeof Leaflet | null>(null),
    markers = useRef<{ id: string; marker: Leaflet.Marker }[]>([]),
    data = useRef(locations),
    selectedRef = useRef(selected?.id || ""),
    scopeRef = useRef<"valley" | "all" | "hub">("valley"),
    [scope, setScope] = useState<"valley" | "all" | "hub">("valley"),
    [active, setActive] = useState(false),
    [version, setVersion] = useState(0),
    [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    data.current = locations;
    selectedRef.current = selected?.id || "";
  });
  useEffect(() => {
    const element = container.current;
    if (!element || !hasLocations) return;
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setActive(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasLocations]);
  useEffect(() => {
    if (!active || !hasLocations || !container.current) return;
    let disposed = false,
      resize: ResizeObserver | undefined,
      instance: Leaflet.Map | undefined,
      deadline: ReturnType<typeof setTimeout> | undefined;
    void import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        api.current = L;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        instance = L.map(container.current, {
          scrollWheelZoom: false,
          zoomControl: false,
          minZoom: 4,
          maxZoom: 16,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });
        map.current = instance;
        L.control.zoom({ position: "topright" }).addTo(instance);
        instance.attributionControl.setPrefix(false);
        const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          updateWhenIdle: true,
          keepBuffer: 0,
        }).addTo(instance);
        let loaded = 0;
        deadline = setTimeout(() => {
          if (!disposed && !loaded) setState("error");
        }, 12000);
        tiles.on("tileload", () => {
          loaded++;
          clearTimeout(deadline);
          if (!disposed) setState("ready");
        });
        tiles.on("load", () => {
          if (!disposed && !loaded) setState("error");
        });
        fitOverview(instance, data.current, scopeRef.current === "all");
        resize = new ResizeObserver(() => {
          if (!instance || disposed) return;
          instance.invalidateSize({ pan: false });
          if (scopeRef.current !== "hub")
            fitOverview(instance, data.current, scopeRef.current === "all");
        });
        resize.observe(container.current);
        setVersion((old) => old + 1);
      })
      .catch(() => {
        if (!disposed) setState("error");
      });
    return () => {
      disposed = true;
      clearTimeout(deadline);
      resize?.disconnect();
      instance?.remove();
      map.current = null;
      markers.current = [];
    };
  }, [active, hasLocations]);
  useEffect(() => {
    const instance = map.current,
      L = api.current;
    if (!instance || !L) return;
    markers.current.forEach(({ marker }) => marker.remove());
    markers.current = data.current.map((location, index) => {
      const marker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: "geographic-pin" + (location.id === selectedRef.current ? " is-selected" : ""),
          html: `<span><b>${index + 1}</b></span>`,
          iconSize: [32, 40],
          iconAnchor: [16, 36],
          tooltipAnchor: [0, -30],
        }),
        title: location.name,
        alt: "Map location: " + location.name,
        keyboard: true,
        riseOnHover: true,
      }).addTo(instance);
      const tooltip = document.createElement("span");
      tooltip.textContent = location.name;
      marker.bindTooltip(tooltip, { direction: "top", className: "geographic-tooltip" });
      marker.on("click", () => {
        selectedRef.current = location.id;
        scopeRef.current = "hub";
        setSelectedId(location.id);
        setScope("hub");
      });
      return { id: location.id, marker };
    });
    const chosen = data.current.find((location) => location.id === selectedRef.current);
    if (scopeRef.current === "hub" && chosen)
      instance.setView([chosen.lat, chosen.lng], 11, { animate: false });
    else fitOverview(instance, data.current, scopeRef.current === "all");
  }, [signature, version]);
  useEffect(() => {
    markers.current.forEach(({ id, marker }) => {
      marker.getElement()?.classList.toggle("is-selected", id === selected?.id);
      marker.setZIndexOffset(id === selected?.id ? 1000 : 0);
      marker
        .getElement()
        ?.setAttribute(
          "aria-label",
          "Map location: " + (data.current.find((location) => location.id === id)?.name || ""),
        );
    });
  }, [selected?.id, signature, version]);
  function locate(location: MappedHub) {
    selectedRef.current = location.id;
    scopeRef.current = "hub";
    setSelectedId(location.id);
    setScope("hub");
    map.current?.setView([location.lat, location.lng], 11, { animate: false });
  }
  function overview(all: boolean) {
    scopeRef.current = all ? "all" : "valley";
    setScope(all ? "all" : "valley");
    if (!all && selected?.area !== "kashmir") {
      const first = locations.find((location) => location.area === "kashmir");
      if (first) {
        selectedRef.current = first.id;
        setSelectedId(first.id);
      }
    }
    if (map.current) fitOverview(map.current, locations, all);
  }
  if (!selected)
    return (
      <p className="geographic-map-empty" data-geographic-map data-map-state="empty">
        Regional hub locations will appear here when available.
      </p>
    );
  const external = `https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=12/${selected.lat}/${selected.lng}`;
  return (
    <div className="geographic-map" data-geographic-map data-map-state={state}>
      <div className="geographic-map-overviews" role="group" aria-label="Map extent">
        {locations.some((location) => location.area === "kashmir") && (
          <button
            type="button"
            aria-pressed={scope === "valley"}
            disabled={state !== "ready"}
            onClick={() => overview(false)}
          >
            Kashmir
          </button>
        )}
        <button
          type="button"
          aria-pressed={
            scope === "all" ||
            (scope === "valley" && !locations.some((location) => location.area === "kashmir"))
          }
          disabled={state !== "ready"}
          onClick={() => overview(true)}
        >
          All {locations.length} {locations.length === 1 ? "hub" : "hubs"}
        </button>
      </div>
      <div className="geographic-map-frame">
        <div
          ref={container}
          className="geographic-map-surface"
          role="region"
          aria-label="Geographic map of Zeebaran regional hubs"
        />
        {state === "loading" && (
          <div className="geographic-map-loading" role="status">
            Loading regional map…
          </div>
        )}
        {state === "error" && (
          <div className="geographic-map-loading" role="status">
            The map could not load.{" "}
            <a href={external} target="_blank" rel="noopener noreferrer">
              Open this location on OpenStreetMap ↗
            </a>
          </div>
        )}
      </div>
      <div className="geographic-map-locations" role="group" aria-label="Choose a mapped hub">
        {locations.map((location, index) => (
          <button
            key={location.id}
            type="button"
            aria-label={"Locate " + location.name}
            aria-pressed={selected.id === location.id}
            disabled={state === "loading"}
            onClick={() => locate(location)}
          >
            <span aria-hidden="true">{index + 1}</span>
            {location.name}
          </button>
        ))}
      </div>
      <div className="geographic-map-details" aria-live="polite">
        <strong>{selected.name}</strong>
        <p>{selected.note}</p>
        <div>
          <span>Pins show regional locations.</span>
          <a
            href={external}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={"Open " + selected.name + " on OpenStreetMap"}
          >
            Open map ↗
          </a>
        </div>
      </div>
    </div>
  );
}
