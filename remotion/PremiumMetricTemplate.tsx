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

const TARGET_VALUE = 98600;
const UNIT = "건";
const TREND_PCT = "+24.7%";
const MICRO_LINE_DATA = [42, 58, 51, 73, 68, 85, 79, 93, 88, 98];

export const PremiumMetricTemplate: React.FC<Props> = ({
  title = "분석 완료",
  subtitle = "이번 달 처리 건수",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main counter
  const counterProgress = spring({
    frame, fps, from: 0, to: 1,
    config: { damping: 22, stiffness: 60, mass: 1.3 },
  });
  const currentValue = Math.round(counterProgress * TARGET_VALUE);

  // Individual element reveals
  const labelOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const numberOpacity = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const numberScale = spring({
    frame: Math.max(0, frame - 8), fps,
    from: 0.85, to: 1,
    config: { damping: 14, stiffness: 90 },
  });
  const trendOpacity = interpolate(frame, [30, 46], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const trendX = interpolate(frame, [30, 46], [-30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [44, 62], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const contextOpacity = interpolate(frame, [56, 72], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Micro sparkline
  const lineProgress = interpolate(frame, [44, 78], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const visiblePts = Math.max(2, Math.round(lineProgress * MICRO_LINE_DATA.length));
  const W = 520, H = 60;
  const pts = MICRO_LINE_DATA.slice(0, visiblePts).map((v, i) => ({
    x: (i / (MICRO_LINE_DATA.length - 1)) * W,
    y: H - (v / 100) * H,
  }));
  const sparkPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Ambient glow pulse
  const glowOpacity = 0.3 + Math.sin(frame / 12) * 0.1;

  // Background slow drift
  const bgShift = Math.sin(frame / 45) * 30;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at ${50 + bgShift * 0.02}% 45%, ${accent}28 0%, #040410 60%)`,
      fontFamily: "Geist, sans-serif", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column",
    }}>
      {/* Subtle noise/dot grid */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(${accent}15 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }} />

      {/* Ambient glow behind number */}
      <div style={{
        position: "absolute", width: 800, height: 400,
        background: `radial-gradient(ellipse, ${accent} 0%, transparent 70%)`,
        opacity: glowOpacity,
        filter: "blur(80px)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
      }} />

      {/* Content column */}
      <div style={{ zIndex: 2, textAlign: "center", width: 900 }}>
        {/* Top label */}
        <div style={{
          opacity: labelOpacity,
          fontSize: 20, fontWeight: 700, color: "#475569",
          letterSpacing: 4, textTransform: "uppercase", marginBottom: 16,
        }}>
          {subtitle}
        </div>

        {/* Massive number */}
        <div style={{
          opacity: numberOpacity,
          transform: `scale(${numberScale})`,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          lineHeight: 1, marginBottom: 12,
        }}>
          <span style={{
            fontSize: 220, fontWeight: 900, letterSpacing: -12,
            background: `linear-gradient(180deg, #ffffff 0%, ${accent}dd 55%, ${accent}66 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 40px ${accent}88)`,
          }}>
            {currentValue.toLocaleString()}
          </span>
          <span style={{
            fontSize: 56, fontWeight: 700, color: accent,
            marginTop: 28, marginLeft: 8,
            opacity: 0.9,
          }}>
            {UNIT}
          </span>
        </div>

        {/* Title below number */}
        <div style={{
          opacity: labelOpacity,
          fontSize: 38, fontWeight: 300, color: "#94a3b8",
          letterSpacing: -1, marginBottom: 28,
        }}>
          {title}
        </div>

        {/* Trend arrow */}
        <div style={{
          opacity: trendOpacity,
          transform: `translateX(${trendX}px)`,
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "10px 24px", borderRadius: 50,
          background: "#22c55e18",
          border: "1px solid #22c55e40",
          marginBottom: 40,
        }}>
          <svg width={20} height={20} viewBox="0 0 20 20">
            <path d="M4 14 L10 6 L16 14" stroke="#22c55e" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>{TREND_PCT}</span>
          <span style={{ fontSize: 16, color: "#475569" }}>전월 대비</span>
        </div>

        {/* Divider */}
        <div style={{
          opacity: lineOpacity,
          width: 520, height: 1, margin: "0 auto 24px",
          background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
        }} />

        {/* Micro sparkline */}
        <div style={{ opacity: lineOpacity, margin: "0 auto 24px", width: 520 }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="microGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.25} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            {pts.length > 1 && (
              <>
                <path
                  d={`${sparkPath} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`}
                  fill="url(#microGrad)"
                />
                <path d={sparkPath} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={accent} />
              </>
            )}
          </svg>
        </div>

        {/* Context micro text */}
        <div style={{
          opacity: contextOpacity,
          display: "flex", justifyContent: "center", gap: 40,
        }}>
          {["최저: 42,100건", "평균: 71,400건", "최고: 98,600건"].map((t, i) => (
            <div key={i} style={{
              fontSize: 15, color: i === 2 ? accent : "#475569",
              fontWeight: i === 2 ? 700 : 400,
            }}>{t}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
