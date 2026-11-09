"use client";
import { useState } from "react";
const nodes = [
  { x: 110, y: 80, name: "Baramulla", sub: "1,580m AMSL", tx: 80, ty: 65, kind: "field" },
  { x: 180, y: 110, name: "Srinagar HQ", sub: "Executive Command", tx: 194, ty: 108, kind: "hq" },
  {
    x: 250,
    y: 145,
    name: "Lassipora Hub",
    sub: "CA Storage & Tech",
    tx: 264,
    ty: 143,
    kind: "cold",
  },
  { x: 320, y: 180, name: "Achabal", sub: "2,250m High Altitude", tx: 332, ty: 182, kind: "field" },
  {
    x: 440,
    y: 225,
    name: "New Delhi Office",
    sub: "National Gateway",
    tx: 380,
    ty: 245,
    kind: "delhi",
  },
] as const;

const stationNotes = [
  "1,580 m · Grower extension and rootstock nurseries in North Kashmir.",
  "1,585 m · Institutional partnerships and field operations at Jawahar Nagar.",
  "8,500 MT · Controlled-atmosphere storage and optical grading in Pulwama.",
  "2,250 m · High-altitude field trials and grower advisory in South Kashmir.",
  "National gateway · Institutional liaison and distribution coordination in Vasant Kunj.",
];
export function RegionMap() {
  const [selected, select] = useState(1);
  return (
    <div className="w-full max-w-lg">
      <div className="relative">
        <svg
          role="img"
          aria-label="Stylised map of the Himalayan corridor from Baramulla through Srinagar, Lassipora and Achabal to New Delhi"
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
            d="M110 80 L180 110 L250 145 L320 180 L440 225"
            stroke="#06642D"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeOpacity="0.7"
            strokeWidth="2.5"
          />
          {nodes.map((n) => {
            const hq = n.kind === "hq";
            return (
              <g key={n.name}>
                <circle
                  className={hq || n.kind === "cold" ? "animate-pulse" : undefined}
                  cx={n.x}
                  cy={n.y}
                  r={hq ? 9 : 7}
                  fill={hq ? "#FE6901" : n.kind === "field" ? "#8CC63F" : "#06642D"}
                  fillOpacity={hq ? 0.25 : 0.3}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={hq ? 6 : 5}
                  fill={hq ? "#FE6901" : n.kind === "delhi" ? "#123B25" : "#06642D"}
                />
                <circle cx={n.x} cy={n.y} r={2} fill="#fff" />
                {n.name === nodes[selected].name && (
                  <circle cx={n.x} cy={n.y} r={12} fill="none" stroke="#06642d" strokeWidth={1.5} />
                )}
                <text x={n.tx} y={n.ty} fill="#123B25" fontSize="11" fontWeight="600">
                  {n.name}
                </text>
                <text x={n.tx} y={n.ty + 12} fill="#4a5a50" fontSize="9">
                  {n.sub}
                </text>
              </g>
            );
          })}
        </svg>
        {nodes.map((n, i) => (
          <button
            key={n.name}
            type="button"
            aria-label={"Show " + n.name}
            aria-pressed={selected === i}
            onClick={() => select(i)}
            style={{ left: (n.x / 520) * 100 + "%", top: (n.y / 266) * 100 + "%" }}
            className="absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
        ))}
      </div>
      <div className="hub-details mt-2 border-t border-line pt-3" aria-live="polite">
        <strong className="text-small text-forest">{nodes[selected].name}</strong>
        <p className="mt-0.5 text-xs text-muted">{stationNotes[selected]}</p>
      </div>
    </div>
  );
}
