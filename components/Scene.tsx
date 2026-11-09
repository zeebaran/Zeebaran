import { useId } from "react";

export type SceneVariant = "rows" | "hills" | "canopy" | "centre";

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Generative placeholder imagery in the brand palette. Pass real photography via
 * <Photo src=... /> and these disappear. Deterministic, so no hydration drift.
 */
export function Scene({
  variant = "rows",
  seed = 7,
  className = "",
}: {
  variant?: SceneVariant;
  seed?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const r = rng(seed * 997);
  const W = 800,
    H = 600;

  const sky = (
    <>
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe8c9" />
          <stop offset="0.55" stopColor="#f3f0dc" />
          <stop offset="1" stopColor="#f7f5ea" />
        </linearGradient>
        <linearGradient id={`grass${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c8f3b" />
          <stop offset="1" stopColor="#0b5a2a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky${uid})`} />
    </>
  );

  const ridge = (base: number, amp: number, freq: number, phase: number, fill: string, o = 1) => {
    let d = `M0 ${H}`;
    for (let x = 0; x <= W; x += 20)
      d += ` L${x} ${base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase) * amp * 0.4}`;
    return <path d={`${d} L${W} ${H} Z`} fill={fill} opacity={o} />;
  };

  let body: React.ReactNode = null;

  if (variant === "rows") {
    const vp = { x: 400, y: 250 };
    const lanes: React.ReactNode[] = [];
    const trees: React.ReactNode[] = [];
    for (let i = -5; i <= 5; i++) {
      const bx = 400 + i * 190;
      lanes.push(
        <polygon
          key={`l${i}`}
          points={`${vp.x},${vp.y} ${bx - 62},${H} ${bx + 62},${H}`}
          fill={i % 2 ? "#a7d36a" : "#8cc63f"}
          opacity={0.5}
        />,
      );
    }
    for (let i = -5; i <= 5; i++) {
      const bx = 400 + (i + 0.5) * 190;
      for (let k = 0; k < 9; k++) {
        const t = Math.pow((k + 1) / 9, 1.7);
        const x = vp.x + (bx - vp.x) * t,
          y = vp.y + (H + 40 - vp.y) * t;
        const rad = 3 + t * 46;
        trees.push(
          <g key={`t${i}-${k}`}>
            <ellipse
              cx={x}
              cy={y + rad * 0.9}
              rx={rad * 0.9}
              ry={rad * 0.22}
              fill="#0b3d20"
              opacity={0.28}
            />
            <rect x={x - rad * 0.07} y={y} width={rad * 0.14} height={rad * 0.9} fill="#4a3320" />
            <circle cx={x} cy={y - rad * 0.1} r={rad} fill={k % 2 ? "#1b7a3a" : "#06642d"} />
            <circle
              cx={x - rad * 0.3}
              cy={y - rad * 0.35}
              r={rad * 0.55}
              fill="#2f9444"
              opacity={0.7}
            />
            {t > 0.12 &&
              [0, 1, 2, 3].map((f) => (
                <circle
                  key={f}
                  cx={x + (r() - 0.5) * rad * 1.3}
                  cy={y + (r() - 0.45) * rad * 1.1}
                  r={Math.max(1.2, rad * 0.09)}
                  fill="#fe6901"
                />
              ))}
          </g>,
        );
      }
    }
    body = (
      <>
        {ridge(235, 18, 0.011, 1, "#a9bd93", 0.9)}
        {ridge(255, 14, 0.018, 3, "#7e9c6a", 0.95)}
        <rect y={vp.y} width={W} height={H - vp.y} fill={`url(#grass${uid})`} />
        {lanes}
        {trees}
      </>
    );
  }

  if (variant === "hills") {
    body = (
      <>
        <circle cx={600} cy={190} r={54} fill="#fe6901" opacity={0.85} />
        <circle cx={600} cy={190} r={96} fill="#fe6901" opacity={0.12} />
        {ridge(250, 26, 0.008, 0.5, "#b9c9a0")}
        {ridge(310, 24, 0.011, 2, "#92ad7b")}
        {ridge(380, 22, 0.014, 4, "#5f9448")}
        {ridge(450, 18, 0.02, 1, "#2f7a3a")}
        {ridge(520, 14, 0.026, 5, "#0b5a2a")}
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${400 + i * 24} Q400 ${380 + i * 24 - 20} 800 ${410 + i * 24}`}
            stroke="#8cc63f"
            strokeOpacity={0.28}
            strokeWidth={1.4}
            fill="none"
          />
        ))}
      </>
    );
  }

  if (variant === "canopy") {
    const leaves: React.ReactNode[] = [];
    for (let i = 0; i < 70; i++) {
      const x = r() * W,
        y = r() * H,
        rot = r() * 180,
        s = 40 + r() * 70;
      leaves.push(
        <ellipse
          key={`e${i}`}
          cx={x}
          cy={y}
          rx={s}
          ry={s * 0.38}
          transform={`rotate(${rot} ${x} ${y})`}
          fill={["#06642d", "#1b7a3a", "#2f9444", "#8cc63f"][i % 4]}
          opacity={0.9}
        />,
      );
    }
    const fruit = Array.from({ length: 9 }).map((_, i) => {
      const x = 80 + r() * 640,
        y = 80 + r() * 440,
        s = 24 + r() * 18;
      return (
        <g key={`f${i}`}>
          <circle cx={x} cy={y} r={s} fill="#fe6901" />
          <circle cx={x - s * 0.3} cy={y - s * 0.3} r={s * 0.32} fill="#ffb070" opacity={0.7} />
        </g>
      );
    });
    body = (
      <>
        <rect width={W} height={H} fill="#0b5a2a" />
        {leaves}
        {fruit}
      </>
    );
  }

  if (variant === "centre") {
    body = (
      <>
        {ridge(280, 22, 0.01, 2, "#a9bd93")}
        {ridge(360, 18, 0.015, 4, "#6e9a58")}
        <rect y={430} width={W} height={H - 430} fill={`url(#grass${uid})`} />
        <polygon points="190,330 400,250 610,330" fill="#123b25" />
        <rect x={210} y={330} width={380} height={140} fill="#f7f5ea" />
        <rect x={210} y={330} width={380} height={12} fill="#06642d" />
        {[250, 340, 470, 540].map((x) => (
          <rect key={x} x={x} y={372} width={36} height={52} rx={4} fill="#123b25" opacity={0.85} />
        ))}
        <rect x={375} y={380} width={50} height={90} rx={4} fill="#fe6901" />
        {[120, 690].map((x, i) => (
          <g key={x}>
            <rect x={x - 5} y={400} width={10} height={70} fill="#4a3320" />
            <circle cx={x} cy={385} r={46} fill={i ? "#1b7a3a" : "#06642d"} />
          </g>
        ))}
      </>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {variant === "canopy" ? null : sky}
      {body}
    </svg>
  );
}
