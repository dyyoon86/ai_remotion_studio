import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

const LAYERS = [
  { label: "프레젠테이션 레이어", sublabel: "UI / UX / API Gateway", zIndex: 3, yOffset: 0 },
  { label: "비즈니스 로직 레이어", sublabel: "서비스 / 규칙 엔진 / 오케스트레이션", zIndex: 2, yOffset: 60 },
  { label: "데이터 레이어", sublabel: "DB / 캐시 / 스토리지", zIndex: 1, yOffset: 120 },
];

export const LayerStackTemplate: React.FC<Props> = ({
  title = "레이어 아키텍처",
  subtitle = "견고하게 분리된 3-티어 구조",
  accent = "#7c3aed",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 18], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const breathe = Math.sin(frame / 20) * 6;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 60% 30%, ${accent}20 0%, #020617 60%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
    }}>
      {/* Diagonal stripe texture */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(135deg, ${accent}06 0, ${accent}06 1px, transparent 1px, transparent 36px)`,
      }} />

      {/* Ambient blobs */}
      <div style={{
        position: "absolute", left: -100, top: "20%",
        width: 600, height: 600,
        borderRadius: 999,
        background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
        filter: "blur(60px)",
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

      {/* Layer stack — centered */}
      <div style={{
        position: "absolute",
        top: 230, left: 160, right: 160,
        height: 520,
        perspective: "1200px",
      }}>
        {LAYERS.map((layer, i) => {
          const delay = 20 + i * 18;
          const sc = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 100 }, delay });
          const op = interpolate(frame, [delay, delay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const entryX = interpolate(frame, [delay, delay + 22], [i % 2 === 0 ? -300 : 300, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          const glowPulse = 0.4 + Math.sin(frame / 18 + i * 1.5) * 0.15;
          const brightness = [1.0, 0.75, 0.52][i];
          const cardBg = `rgba(15, 23, 42, ${brightness})`;

          return (
            <div key={i} style={{
              position: "absolute",
              top: layer.yOffset,
              left: i * 24,
              right: i * 24,
              opacity: op,
              transform: `translateX(${entryX}px) scale(${sc}) rotateX(${12 - i * 4}deg) skewX(-1deg)`,
              transformStyle: "preserve-3d",
              zIndex: layer.zIndex,
            }}>
              <div style={{
                background: cardBg,
                border: `1.5px solid ${accent}${Math.round(30 + i * 15).toString(16)}`,
                borderRadius: 20,
                padding: "30px 40px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: `0 ${8 + i * 6}px ${24 + i * 10}px rgba(0,0,0,0.5), 0 0 ${40}px ${accent}${Math.round(glowPulse * 60).toString(16)}`,
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}>
                {/* Top edge glow */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
                }} />

                {/* Layer number badge */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accent}60 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#fff",
                  boxShadow: `0 0 18px ${accent}60`,
                }}>
                  L{i + 1}
                </div>

                {/* Text */}
                <div style={{ flex: 1, marginLeft: 28 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{layer.label}</div>
                  <div style={{ fontSize: 18, color: "#64748b", marginTop: 6 }}>{layer.sublabel}</div>
                </div>

                {/* Connector dots on right */}
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: accent,
                      opacity: 0.3 + d * 0.3,
                      boxShadow: `0 0 6px ${accent}`,
                    }} />
                  ))}
                </div>
              </div>

              {/* Shadow plane below card */}
              <div style={{
                position: "absolute", bottom: -10, left: 20, right: 20, height: 16,
                background: `radial-gradient(ellipse, ${accent}20, transparent 70%)`,
                filter: "blur(8px)",
              }} />
            </div>
          );
        })}

        {/* Vertical connector line */}
        <div style={{
          position: "absolute",
          left: 64, top: 52, height: interpolate(frame, [56, 76], [0, 168], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          width: 2,
          background: `linear-gradient(180deg, ${accent}80, ${accent}20)`,
          borderRadius: 2,
        }} />
      </div>

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
        background: `linear-gradient(0deg, #020617 0%, transparent 100%)`,
      }} />
    </AbsoluteFill>
  );
};
