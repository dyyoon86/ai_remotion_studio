import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  productA?: string;
  productB?: string;
};

const NUM_DOTS = 5;

export const BidirectionalTemplate: React.FC<Props> = ({
  title = "양방향 연결",
  subtitle = "실시간 데이터 동기화 아키텍처",
  accent = "#0ea5e9",
  productA = "클라이언트",
  productB = "서버",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 16], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const leftSc = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 110 }, delay: 16 });
  const leftOp = interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightSc = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 110 }, delay: 24 });
  const rightOp = interpolate(frame, [24, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lineOp = interpolate(frame, [36, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [36, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Traveling dots — forward (left to right)
  const forwardDots = Array.from({ length: NUM_DOTS }, (_, i) => {
    const period = 40;
    const offset = (i / NUM_DOTS) * period;
    const t = ((frame - 50 + offset) % period) / period;
    return Math.max(0, Math.min(1, t));
  });

  // Traveling dots — backward (right to left)
  const backwardDots = Array.from({ length: NUM_DOTS }, (_, i) => {
    const period = 40;
    const offset = (i / NUM_DOTS) * period + 20;
    const t = 1 - ((frame - 50 + offset) % period) / period;
    return Math.max(0, Math.min(1, t));
  });

  const dotsOp = interpolate(frame, [50, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Node pulse
  const leftPulse = 1 + Math.sin(frame / 12) * 0.05;
  const rightPulse = 1 + Math.sin(frame / 12 + Math.PI) * 0.05;

  // Line y positions
  const LINE_Y_TOP = 420;
  const LINE_Y_BOTTOM = 480;
  const LINE_LEFT = 280;
  const LINE_RIGHT = 1640;
  const lineMiddle = LINE_RIGHT * lineWidth;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 50%, ${accent}15 0%, #020617 65%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
    }}>
      {/* Circuit-like background */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Center ambient glow */}
      <div style={{
        position: "absolute", top: "35%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500, height: 200,
        background: `radial-gradient(ellipse, ${accent}20 0%, transparent 70%)`,
        filter: "blur(40px)",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 70, left: 0, right: 0, textAlign: "center",
        opacity: headerOp, transform: `translateY(${headerY}px)`,
      }}>
        <div style={{
          fontSize: 54, fontWeight: 800, letterSpacing: -2,
          background: `linear-gradient(90deg, #fff 20%, ${accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#64748b", marginTop: 10 }}>{subtitle}</div>
      </div>

      {/* Left node */}
      <div style={{
        position: "absolute", left: 80, top: "50%",
        transform: `translateY(-50%) scale(${leftSc * leftPulse})`,
        opacity: leftOp,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        width: 200,
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: 28,
          background: `linear-gradient(135deg, ${accent}30 0%, #0f172a 100%)`,
          border: `2px solid ${accent}80`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 50px ${accent}30, inset 0 1px 0 ${accent}40`,
          position: "relative",
        }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute",
            width: 170, height: 170,
            borderRadius: 36,
            border: `1px solid ${accent}30`,
          }} />
          <div style={{ fontSize: 52 }}>💻</div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, textAlign: "center" }}>{productA}</div>
        <div style={{ fontSize: 16, color: "#64748b", textAlign: "center" }}>요청 송신 / 수신 처리</div>
      </div>

      {/* Right node */}
      <div style={{
        position: "absolute", right: 80, top: "50%",
        transform: `translateY(-50%) scale(${rightSc * rightPulse})`,
        opacity: rightOp,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        width: 200,
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: 28,
          background: `linear-gradient(135deg, ${accent}30 0%, #0f172a 100%)`,
          border: `2px solid ${accent}80`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 50px ${accent}30, inset 0 1px 0 ${accent}40`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            width: 170, height: 170,
            borderRadius: 36,
            border: `1px solid ${accent}30`,
          }} />
          <div style={{ fontSize: 52 }}>🖥️</div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, textAlign: "center" }}>{productB}</div>
        <div style={{ fontSize: 16, color: "#64748b", textAlign: "center" }}>응답 처리 / 데이터 반환</div>
      </div>

      {/* Connection lines */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {/* Top arrow line (left to right) */}
        <line
          x1={LINE_LEFT}
          y1={LINE_Y_TOP}
          x2={LINE_LEFT + (LINE_RIGHT - LINE_LEFT) * lineWidth}
          y2={LINE_Y_TOP}
          stroke={accent}
          strokeWidth={2.5}
          strokeOpacity={lineOp}
          strokeDasharray="8 4"
        />
        {/* Arrowhead top right */}
        {lineWidth > 0.95 && (
          <polygon
            points={`${LINE_RIGHT},${LINE_Y_TOP} ${LINE_RIGHT - 16},${LINE_Y_TOP - 8} ${LINE_RIGHT - 16},${LINE_Y_TOP + 8}`}
            fill={accent}
            opacity={lineOp}
          />
        )}

        {/* Bottom arrow line (right to left) */}
        <line
          x1={LINE_RIGHT}
          y1={LINE_Y_BOTTOM}
          x2={LINE_RIGHT - (LINE_RIGHT - LINE_LEFT) * lineWidth}
          y2={LINE_Y_BOTTOM}
          stroke={accent}
          strokeWidth={2.5}
          strokeOpacity={lineOp * 0.7}
          strokeDasharray="8 4"
        />
        {/* Arrowhead bottom left */}
        {lineWidth > 0.95 && (
          <polygon
            points={`${LINE_LEFT},${LINE_Y_BOTTOM} ${LINE_LEFT + 16},${LINE_Y_BOTTOM - 8} ${LINE_LEFT + 16},${LINE_Y_BOTTOM + 8}`}
            fill={accent}
            opacity={lineOp * 0.7}
          />
        )}

        {/* Traveling forward dots */}
        {forwardDots.map((t, i) => (
          <circle
            key={`f${i}`}
            cx={LINE_LEFT + (LINE_RIGHT - LINE_LEFT) * t}
            cy={LINE_Y_TOP}
            r={5}
            fill={accent}
            opacity={dotsOp * 0.9}
            filter="url(#glow)"
          />
        ))}

        {/* Traveling backward dots */}
        {backwardDots.map((t, i) => (
          <circle
            key={`b${i}`}
            cx={LINE_LEFT + (LINE_RIGHT - LINE_LEFT) * t}
            cy={LINE_Y_BOTTOM}
            r={4}
            fill={accent}
            opacity={dotsOp * 0.6}
          />
        ))}

        {/* Label boxes on lines */}
        {lineWidth > 0.98 && (
          <>
            <rect x={860} y={LINE_Y_TOP - 22} width={200} height={30} rx={8} fill={`${accent}20`} stroke={accent} strokeWidth={1} opacity={lineOp} />
            <text x={960} y={LINE_Y_TOP - 2} textAnchor="middle" fill={accent} fontSize={14} fontFamily="Geist, sans-serif" opacity={lineOp}>Request →</text>
            <rect x={860} y={LINE_Y_BOTTOM - 8} width={200} height={30} rx={8} fill={`${accent}12`} stroke={`${accent}60`} strokeWidth={1} opacity={lineOp * 0.7} />
            <text x={960} y={LINE_Y_BOTTOM + 12} textAnchor="middle" fill={accent} fontSize={14} fontFamily="Geist, sans-serif" opacity={lineOp * 0.7}>← Response</text>
          </>
        )}

        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* Bottom accent */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: lineOp,
      }} />
    </AbsoluteFill>
  );
};
