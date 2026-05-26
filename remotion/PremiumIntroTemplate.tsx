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

export const PremiumIntroTemplate: React.FC<Props> = ({
  title = "PREMIUM",
  subtitle = "차세대 AI 플랫폼의 시작",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line draw
  const lineWidth = interpolate(frame, [0, 30], [0, 1920], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [0, 8, 60, 80], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Title reveal
  const titleScale = spring({
    frame: Math.max(0, frame - 28), fps,
    from: 1.08, to: 1,
    config: { damping: 16, stiffness: 80 },
  });
  const titleOpacity = interpolate(frame, [28, 46], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleClip = interpolate(frame, [28, 54], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [48, 64], [24, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Slow background zoom
  const bgScale = interpolate(frame, [0, 90], [1.04, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Particle dots: deterministic pseudo-random positions
  const particles = Array.from({ length: 28 }, (_, i) => ({
    x: ((i * 137.508) % 1920),
    y: ((i * 97.3 + 40) % 1080),
    delay: (i * 3) % 40,
    size: 1.5 + (i % 3),
    speed: 6 + (i % 5) * 2,
  }));

  const decorLineOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      fontFamily: "Geist, sans-serif",
      overflow: "hidden",
    }}>
      {/* Deep background with zoom */}
      <div style={{
        position: "absolute", inset: -40,
        transform: `scale(${bgScale})`,
        background: `radial-gradient(ellipse at 50% 50%, ${accent}30 0%, #02020c 55%)`,
      }} />

      {/* Grid texture */}
      <AbsoluteFill style={{
        backgroundImage: `
          linear-gradient(${accent}08 1px, transparent 1px),
          linear-gradient(90deg, ${accent}08 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        transform: `scale(${bgScale})`,
      }} />

      {/* Particles */}
      {particles.map((p, i) => {
        const pOpacity = interpolate(frame, [p.delay, p.delay + 12], [0, 0.6], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const pY = p.y - ((frame - p.delay) * 0.4) % 300;
        return (
          <div key={i} style={{
            position: "absolute",
            left: p.x, top: pY,
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: accent,
            opacity: pOpacity,
            boxShadow: `0 0 ${p.size * 3}px ${accent}`,
          }} />
        );
      })}

      {/* Horizontal accent line draw */}
      <div style={{
        position: "absolute",
        top: "50%", left: 0,
        width: lineWidth, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${accent} 20%, #fff 50%, ${accent} 80%, transparent 100%)`,
        opacity: lineOpacity,
        boxShadow: `0 0 20px ${accent}, 0 0 60px ${accent}80`,
        transform: "translateY(-50%)",
      }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${titleScale})`,
        textAlign: "center",
        opacity: titleOpacity,
        clipPath: `inset(0 ${100 - titleClip}% 0 0)`,
        zIndex: 4,
      }}>
        <div style={{
          fontSize: 180, fontWeight: 900, letterSpacing: -8, lineHeight: 0.9,
          background: `linear-gradient(180deg, #ffffff 0%, ${accent}cc 60%, ${accent}44 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 60px ${accent}88)`,
        }}>
          {title}
        </div>
      </div>

      {/* Decorative side lines */}
      <div style={{
        position: "absolute", top: "50%", left: 80,
        transform: "translateY(-50%)", opacity: decorLineOpacity,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {[100, 60, 30].map((w, i) => (
          <div key={i} style={{
            width: w, height: 2, borderRadius: 1,
            background: i === 0 ? accent : `${accent}${60 - i * 20}`,
          }} />
        ))}
      </div>
      <div style={{
        position: "absolute", top: "50%", right: 80,
        transform: "translateY(-50%)", opacity: decorLineOpacity,
        display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end",
      }}>
        {[100, 60, 30].map((w, i) => (
          <div key={i} style={{
            width: w, height: 2, borderRadius: 1,
            background: i === 0 ? accent : `${accent}${60 - i * 20}`,
          }} />
        ))}
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", bottom: 180,
        width: "100%", textAlign: "center",
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        zIndex: 4,
      }}>
        <div style={{ fontSize: 32, fontWeight: 300, color: "#94a3b8", letterSpacing: 6 }}>
          {subtitle}
        </div>
        <div style={{
          width: 64, height: 2, background: accent,
          margin: "20px auto 0", borderRadius: 1,
        }} />
      </div>

      {/* Bottom vignette */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(transparent, #02020c)",
      }} />
    </AbsoluteFill>
  );
};
