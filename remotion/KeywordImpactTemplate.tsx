import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

export const KeywordImpactTemplate: React.FC<Props> = ({
  title = "혁신",
  subtitle = "AI가 만들어내는 새로운 가능성",
  accent = "#f59e0b",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Impact slam: frame 0–18
  const impactScale = spring({ frame, fps, from: 2.2, to: 1, config: { damping: 8, stiffness: 200 } });
  const impactOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Blur clears as scale settles
  const blurAmount = interpolate(frame, [0, 20], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Shockwave ring
  const ringScale = interpolate(frame, [4, 38], [0.2, 3.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringOpacity = interpolate(frame, [4, 38], [0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Second ring delayed
  const ring2Scale = interpolate(frame, [14, 50], [0.2, 3.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring2Opacity = interpolate(frame, [14, 50], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle slide in after impact
  const subOpacity = interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [28, 44], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sustained gentle pulse
  const sustainedPulse = 1 + Math.sin(frame / 10) * 0.03;

  // Particle dots
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    delay: i * 3,
  }));

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 50% 50%, ${accent}22 0%, #020617 65%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column",
    }}>
      {/* Background noise texture */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${accent}04 3px, ${accent}04 4px)`,
      }} />

      {/* Shockwave ring 1 */}
      <div style={{
        position: "absolute",
        width: 400, height: 400,
        borderRadius: 999,
        border: `3px solid ${accent}`,
        transform: `scale(${ringScale})`,
        opacity: ringOpacity,
        pointerEvents: "none",
      }} />

      {/* Shockwave ring 2 */}
      <div style={{
        position: "absolute",
        width: 400, height: 400,
        borderRadius: 999,
        border: `2px solid ${accent}80`,
        transform: `scale(${ring2Scale})`,
        opacity: ring2Opacity,
        pointerEvents: "none",
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        width: 700, height: 700,
        borderRadius: 999,
        background: `radial-gradient(circle, ${accent}28 0%, transparent 65%)`,
        filter: "blur(30px)",
        transform: `scale(${sustainedPulse})`,
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => {
        const dist = interpolate(frame, [8 + p.delay, 90], [60, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const pOp = interpolate(frame, [8 + p.delay, 18 + p.delay, 80, 90], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = Math.cos(p.angle) * dist;
        const y = Math.sin(p.angle) * dist;
        return (
          <div key={i} style={{
            position: "absolute",
            width: 6, height: 6,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
            transform: `translate(${x}px, ${y}px)`,
            opacity: pOp,
          }} />
        );
      })}

      {/* Main keyword */}
      <div style={{
        fontSize: 200,
        fontWeight: 900,
        letterSpacing: -8,
        lineHeight: 1,
        textAlign: "center",
        opacity: impactOpacity,
        transform: `scale(${impactScale * sustainedPulse})`,
        filter: `blur(${blurAmount}px)`,
        background: `linear-gradient(135deg, #fff 0%, ${accent} 50%, #fff 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "none",
        zIndex: 10,
      }}>
        {title}
      </div>

      {/* Subtitle */}
      <div style={{
        marginTop: 40,
        fontSize: 34,
        fontWeight: 500,
        color: "#cbd5e1",
        letterSpacing: -0.5,
        textAlign: "center",
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        zIndex: 10,
      }}>
        {subtitle}
      </div>

      {/* Accent underline */}
      <div style={{
        marginTop: 20,
        width: interpolate(frame, [44, 64], [0, 320], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        height: 3,
        borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: subOpacity,
        zIndex: 10,
      }} />

      {/* Corner accents */}
      {[
        { top: 40, left: 40, rotate: 0 },
        { top: 40, right: 40, rotate: 90 },
        { bottom: 40, right: 40, rotate: 180 },
        { bottom: 40, left: 40, rotate: 270 },
      ].map((pos, i) => {
        const { rotate, ...placement } = pos;
        return (
        <div key={i} style={{
          position: "absolute",
          ...placement,
          width: 50, height: 50,
          border: `2px solid ${accent}60`,
          borderRight: "none", borderBottom: "none",
          transform: `rotate(${rotate}deg)`,
          borderRadius: 4,
          opacity: subOpacity,
        }} />
        );
      })}
    </AbsoluteFill>
  );
};
