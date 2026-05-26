import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

const CARDS = [
  { label: "속도", value: "2.4×", desc: "처리 성능 향상" },
  { label: "정확도", value: "99.1%", desc: "분석 신뢰도" },
  { label: "비용", value: "–38%", desc: "운영 비용 절감" },
  { label: "자동화", value: "87%", desc: "반복 업무 자동화" },
  { label: "응답", value: "< 1s", desc: "실시간 처리 속도" },
  { label: "확장", value: "∞", desc: "무제한 스케일링" },
];

export const GridCardTemplate: React.FC<Props> = ({
  title = "핵심 성과 지표",
  subtitle = "AI 도입 후 측정된 실제 개선 수치",
  accent = "#10b981",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 18], [-24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const floatOffset = Math.sin(frame / 15) * 4;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 30% 20%, ${accent}18 0%, #020617 55%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
    }}>
      {/* Dot grid */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${accent}20 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.8,
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 70, left: 0, right: 0, textAlign: "center",
        opacity: headerOp, transform: `translateY(${headerY}px)`,
      }}>
        <div style={{
          fontSize: 56, fontWeight: 800, letterSpacing: -2,
          background: `linear-gradient(90deg, #fff 40%, ${accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#64748b", marginTop: 10 }}>{subtitle}</div>
      </div>

      {/* 2×3 grid */}
      <div style={{
        position: "absolute",
        top: 220, left: 100, right: 100, bottom: 80,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 24,
      }}>
        {CARDS.map((card, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const delay = 20 + row * 12 + col * 8;
          const sc = spring({ frame, fps, from: 0.7, to: 1, config: { damping: 14, stiffness: 130 }, delay });
          const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const localFloat = Math.sin(frame / 15 + i * 0.8) * 3;
          const isActive = frame > delay + 10;

          return (
            <div key={i} style={{
              opacity: op,
              transform: `scale(${sc}) translateY(${localFloat}px)`,
              background: `linear-gradient(135deg, ${accent}12 0%, #0f172a 100%)`,
              border: `1px solid ${isActive ? accent + "60" : accent + "20"}`,
              borderRadius: 18,
              padding: "28px 24px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              boxShadow: isActive ? `0 0 28px ${accent}18, inset 0 1px 0 ${accent}25` : "none",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Accent top bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${accent}, ${accent}40)`,
                borderRadius: "18px 18px 0 0",
              }} />

              <div style={{ fontSize: 16, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>
                {card.label}
              </div>
              <div style={{
                fontSize: 56, fontWeight: 900, letterSpacing: -2,
                color: accent, lineHeight: 1,
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 16, color: "#94a3b8", fontWeight: 400 }}>
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: `linear-gradient(0deg, #020617 0%, transparent 100%)`,
      }} />
    </AbsoluteFill>
  );
};
