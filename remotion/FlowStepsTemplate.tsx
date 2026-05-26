import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

const STEPS = [
  { label: "분석", desc: "데이터를 수집하고\n핵심 인사이트를 추출합니다" },
  { label: "설계", desc: "최적의 구조와\n전략을 수립합니다" },
  { label: "구현", desc: "빠르고 정확하게\n실행에 옮깁니다" },
  { label: "검증", desc: "결과를 측정하고\n지속 개선합니다" },
];

export const FlowStepsTemplate: React.FC<Props> = ({
  title = "단계별 흐름도",
  subtitle = "체계적인 프로세스로 성과를 만듭니다",
  accent = "#06b6d4",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 20], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pulse = 1 + Math.sin(frame / 8) * 0.08;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 0%, ${accent}20 0%, #020617 60%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
    }}>
      {/* Grid texture */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 80, left: 0, right: 0, textAlign: "center",
        opacity: headerOpacity, transform: `translateY(${headerY}px)`,
      }}>
        <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2,
          background: `linear-gradient(90deg, #fff 0%, ${accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {title}
        </div>
        <div style={{ fontSize: 26, color: "#94a3b8", marginTop: 12, fontWeight: 400 }}>
          {subtitle}
        </div>
      </div>

      {/* Steps row */}
      <div style={{
        position: "absolute", top: 280, left: 80, right: 80,
        display: "flex", alignItems: "center", gap: 0,
      }}>
        {STEPS.map((step, i) => {
          const entryStart = 24 + i * 14;
          const sc = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 120 }, delay: entryStart });
          const op = interpolate(frame, [entryStart, entryStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const arrowOp = interpolate(frame, [entryStart + 12, entryStart + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const travelX = interpolate(frame, [entryStart + 12, entryStart + 28], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <React.Fragment key={i}>
              {/* Card */}
              <div style={{
                flex: 1,
                opacity: op,
                transform: `scale(${sc})`,
                background: `linear-gradient(135deg, ${accent}18 0%, #0f172a 100%)`,
                border: `1.5px solid ${accent}50`,
                borderRadius: 20,
                padding: "36px 28px",
                display: "flex", flexDirection: "column", gap: 16,
                boxShadow: `0 0 40px ${accent}15, inset 0 1px 0 ${accent}30`,
              }}>
                {/* Number badge */}
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accent}80 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, fontWeight: 900, color: "#020617",
                  transform: `scale(${i === Math.floor((frame - 30) / 14) % 4 ? pulse : 1})`,
                  boxShadow: `0 0 20px ${accent}60`,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{step.label}</div>
                <div style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {step.desc}
                </div>
              </div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: arrowOp }}>
                  {/* Traveling dot */}
                  <div style={{
                    position: "absolute",
                    width: 10, height: 10, borderRadius: 999,
                    background: accent,
                    boxShadow: `0 0 12px ${accent}`,
                    transform: `translateX(${travelX - 28}px)`,
                    marginTop: 23,
                  }} />
                  <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${accent}80, ${accent})`, borderRadius: 2 }} />
                  <div style={{
                    width: 0, height: 0,
                    borderTop: "7px solid transparent",
                    borderBottom: "7px solid transparent",
                    borderLeft: `10px solid ${accent}`,
                    marginTop: -2,
                  }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />
    </AbsoluteFill>
  );
};
