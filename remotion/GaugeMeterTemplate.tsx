import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const TARGET_PERCENT = 87;
// Gauge arc: from -210deg to +30deg (240deg sweep), 0% = -210deg, 100% = +30deg
const DEG_START = -210;
const DEG_TOTAL = 240;

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export const GaugeMeterTemplate: React.FC<Props> = ({
  title = "성능 지표",
  subtitle = "실시간 측정",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame, fps, from: 0, to: 1,
    config: { damping: 18, stiffness: 60, mass: 1.2 },
  });

  const currentPct = progress * TARGET_PERCENT;
  const currentDeg = DEG_START + (progress * DEG_TOTAL * TARGET_PERCENT) / 100;

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [12, 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const numScale = interpolate(frame, [10, 30], [0.5, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const CX = 300, CY = 280, R_OUTER = 200, R_INNER = 150;
  const needlePt = polarToXY(CX, CY, R_OUTER - 20, currentDeg);

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const deg = DEG_START + (DEG_TOTAL * i) / 10;
    const inner = polarToXY(CX, CY, R_INNER + 10, deg);
    const outer = polarToXY(CX, CY, R_INNER + 30, deg);
    return { inner, outer, i };
  });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 80%, ${accent}28 0%, #060612 70%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Geist, sans-serif",
    }}>
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(${accent}12 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
        {/* Title */}
        <div style={{
          opacity: titleOpacity, fontSize: 52, fontWeight: 900,
          color: "#fff", letterSpacing: -2, marginBottom: 8, textAlign: "center",
        }}>{title}</div>
        <div style={{
          opacity: subtitleOpacity, fontSize: 22, color: "#64748b",
          marginBottom: 40, letterSpacing: -0.3,
        }}>{subtitle}</div>

        {/* SVG Gauge */}
        <div style={{ position: "relative", width: 600, height: 360 }}>
          <svg width={600} height={360} viewBox="0 0 600 360">
            {/* Background track */}
            <path
              d={describeArc(CX, CY, R_OUTER, DEG_START, DEG_START + DEG_TOTAL)}
              fill="none" stroke="#1e2030" strokeWidth={28} strokeLinecap="round"
            />
            {/* Inner ring shadow */}
            <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#0f1020" strokeWidth={2} />

            {/* Colored progress arc */}
            {progress > 0.01 && (
              <path
                d={describeArc(CX, CY, R_OUTER, DEG_START, currentDeg)}
                fill="none"
                stroke={`url(#gaugeGrad)`}
                strokeWidth={28}
                strokeLinecap="round"
              />
            )}

            {/* Gradient def */}
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor={accent} />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Ticks */}
            {ticks.map(({ inner, outer, i }) => (
              <line
                key={i}
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={i <= Math.round(progress * 10 * TARGET_PERCENT / 100) ? accent : "#2a2a4a"}
                strokeWidth={i % 5 === 0 ? 3 : 1.5}
              />
            ))}

            {/* Needle */}
            <line
              x1={CX} y1={CY}
              x2={needlePt.x} y2={needlePt.y}
              stroke="#fff" strokeWidth={3} strokeLinecap="round"
              opacity={0.9}
            />
            <circle cx={CX} cy={CY} r={14} fill="#1e2030" stroke={accent} strokeWidth={3} />
            <circle cx={CX} cy={CY} r={5} fill={accent} />

            {/* Needle glow dot */}
            <circle cx={needlePt.x} cy={needlePt.y} r={6}
              fill={accent} opacity={0.85}
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>

          {/* Center number */}
          <div style={{
            position: "absolute", bottom: 60, left: "50%",
            transform: `translateX(-50%) scale(${numScale})`,
            textAlign: "center",
          }}>
            <span style={{
              fontSize: 96, fontWeight: 900, letterSpacing: -4,
              background: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              {Math.round(currentPct)}
            </span>
            <span style={{ fontSize: 40, fontWeight: 700, color: accent }}>%</span>
          </div>
        </div>

        {/* Label row */}
        <div style={{
          opacity: subtitleOpacity,
          display: "flex", gap: 48, marginTop: -10,
        }}>
          {["낮음", "보통", "높음", "최고"].map((lbl, i) => (
            <div key={i} style={{
              fontSize: 16, color: i === 3 ? accent : "#475569",
              fontWeight: i === 3 ? 700 : 400, letterSpacing: 1,
            }}>{lbl}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
