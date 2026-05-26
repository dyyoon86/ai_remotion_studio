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

export const FloatingCard3DTemplate: React.FC<Props> = ({
  title = "3D 플로팅 카드",
  subtitle = "AI 분석 결과",
  accent = "#8b5cf6",
  productA = "Premium Plan",
  productB = "Enterprise",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardEnterScale = spring({
    frame, fps, from: 0.7, to: 1,
    config: { damping: 14, stiffness: 80, mass: 1.1 },
  });
  const cardOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Continuous float (sin wave Y offset)
  const floatY = Math.sin(frame / 18) * 22;

  // 3D rotation: rotateY swings, rotateX tilts
  const rotateY = Math.sin(frame / 22) * 18;
  const rotateX = Math.cos(frame / 28) * 10;

  // Shadow follows rotation
  const shadowBlur = 60 + Math.abs(Math.sin(frame / 22)) * 40;
  const shadowOffsetX = rotateY * 1.8;
  const shadowOffsetY = 30 + floatY * 0.5;

  // Content reveals
  const line1Opacity = interpolate(frame, [20, 34], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const line2Opacity = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const line3Opacity = interpolate(frame, [40, 54], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(frame, [50, 64], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Shimmer position
  const shimmerX = interpolate(frame, [0, 90], [-200, 800], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 40% 50%, ${accent}20 0%, #050510 60%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Geist, sans-serif",
      perspective: "1200px",
    }}>
      {/* Background rings */}
      {[400, 600, 800].map((r, i) => (
        <div key={i} style={{
          position: "absolute", width: r, height: r, borderRadius: "50%",
          border: `1px solid ${accent}${["20", "12", "08"][i]}`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
      ))}

      {/* 3D Card wrapper */}
      <div style={{
        transform: `translateY(${floatY}px) scale(${cardEnterScale})`,
        opacity: cardOpacity,
        transformStyle: "preserve-3d",
        perspective: "1200px",
        filter: `drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${accent}40)`,
      }}>
        <div style={{
          width: 560, height: 360,
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
          transformStyle: "preserve-3d",
          borderRadius: 28,
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          border: `1px solid ${accent}50`,
          boxShadow: `inset 0 1px 0 ${accent}30, inset 0 -1px 0 rgba(0,0,0,0.5)`,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Shimmer */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `linear-gradient(105deg, transparent 30%, ${accent}18 ${shimmerX - 100}px, ${accent}38 ${shimmerX}px, ${accent}18 ${shimmerX + 100}px, transparent 70%)`,
          }} />

          {/* Top accent bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${accent}, #ec4899, #06b6d4)`,
          }} />

          {/* Card content */}
          <div style={{ padding: "36px 40px", height: "100%", boxSizing: "border-box" }}>
            {/* Icon row */}
            <div style={{
              opacity: line1Opacity,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 28,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>✦</div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: "#475569",
                letterSpacing: 3, textTransform: "uppercase",
              }}>EXCLUSIVE</div>
            </div>

            {/* Title */}
            <div style={{
              opacity: line2Opacity,
              fontSize: 44, fontWeight: 900, letterSpacing: -2,
              color: "#fff", lineHeight: 1, marginBottom: 12,
            }}>
              {title}
            </div>

            {/* Subtitle */}
            <div style={{
              opacity: line3Opacity,
              fontSize: 18, color: "#64748b", marginBottom: 28,
            }}>
              {subtitle}
            </div>

            {/* Bottom row */}
            <div style={{
              opacity: badgeOpacity,
              display: "flex", gap: 12, alignItems: "center",
              marginTop: "auto",
            }}>
              <div style={{
                padding: "8px 18px", borderRadius: 20,
                background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                color: "#fff", fontSize: 14, fontWeight: 700,
                boxShadow: `0 4px 20px ${accent}60`,
              }}>
                {productA}
              </div>
              <div style={{
                padding: "8px 18px", borderRadius: 20,
                border: `1px solid ${accent}50`,
                color: accent, fontSize: 14, fontWeight: 600,
              }}>
                {productB}
              </div>
            </div>
          </div>

          {/* Bottom edge light */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
          }} />
        </div>
      </div>

      {/* Ground reflection */}
      <div style={{
        position: "absolute",
        top: "62%", left: "50%",
        transform: `translateX(-50%) translateY(${floatY * 0.3}px)`,
        width: 500, height: 60,
        background: `radial-gradient(ellipse, ${accent}25 0%, transparent 70%)`,
        filter: "blur(12px)",
      }} />
    </AbsoluteFill>
  );
};
