import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const ImageEmphasisTemplate: React.FC<Props> = ({
  title = "이 순간을 기억하세요",
  subtitle = "AI 영상 자동화",
  accent = "#f59e0b",
  image,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ken Burns: slow zoom from 1.0 to 1.08 over 90 frames
  const kbScale = interpolate(frame, [0, 90], [1, 1.08], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const kbX = interpolate(frame, [0, 90], [0, -20], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const kbY = interpolate(frame, [0, 90], [0, -10], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const frameOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const frameScale = spring({ frame, fps, from: 0.92, to: 1, config: { damping: 16, stiffness: 80 } });

  const chipOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const chipX = interpolate(frame, [30, 50], [-60, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [50, 68], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Pulsing accent border glow
  const glowIntensity = 0.5 + Math.sin(frame / 10) * 0.3;

  const placeholder = `linear-gradient(135deg, #1e293b 0%, #0f172a 50%, ${accent}22 100%)`;

  return (
    <AbsoluteFill style={{
      background: "#08090a",
      fontFamily: "Geist, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Image frame with Ken Burns */}
      <div style={{
        width: 900,
        height: 620,
        position: "relative",
        opacity: frameOpacity,
        transform: `scale(${frameScale})`,
        borderRadius: 4,
        overflow: "hidden",
      }}>
        {/* Image */}
        <div style={{
          position: "absolute",
          inset: -40,
          backgroundImage: image ? `url(${image})` : placeholder,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
          transformOrigin: "center",
        }} />

        {/* Dark vignette on image */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* Accent frame border */}
        <div style={{
          position: "absolute",
          inset: 0,
          border: `2px solid ${accent}`,
          borderRadius: 4,
          boxShadow: `inset 0 0 40px ${accent}${Math.round(glowIntensity * 40).toString(16).padStart(2, "0")}, 0 0 60px ${accent}${Math.round(glowIntensity * 80).toString(16).padStart(2, "0")}`,
          pointerEvents: "none",
        }} />

        {/* Corner accent marks */}
        {[
          { top: -1, left: -1, borderTop: `3px solid ${accent}`, borderLeft: `3px solid ${accent}` },
          { top: -1, right: -1, borderTop: `3px solid ${accent}`, borderRight: `3px solid ${accent}` },
          { bottom: -1, left: -1, borderBottom: `3px solid ${accent}`, borderLeft: `3px solid ${accent}` },
          { bottom: -1, right: -1, borderBottom: `3px solid ${accent}`, borderRight: `3px solid ${accent}` },
        ].map((style, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 28, height: 28,
            ...style,
          }} />
        ))}

        {/* Title chip overlay */}
        <div style={{
          position: "absolute",
          bottom: 32,
          left: 32,
          opacity: chipOpacity,
          transform: `translateX(${chipX}px)`,
        }}>
          <div style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${accent}60`,
            borderLeft: `4px solid ${accent}`,
            borderRadius: "0 8px 8px 0",
            padding: "14px 24px",
          }}>
            <div style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -1,
              lineHeight: 1.2,
            }}>
              {title}
            </div>
            <div style={{
              opacity: subtitleOpacity,
              fontSize: 18,
              color: accent,
              marginTop: 6,
              fontWeight: 500,
              letterSpacing: 1,
            }}>
              {subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Outer glow ring */}
      <div style={{
        position: "absolute",
        width: 960,
        height: 680,
        borderRadius: 8,
        boxShadow: `0 0 120px ${accent}${Math.round(glowIntensity * 50).toString(16).padStart(2, "0")}`,
        pointerEvents: "none",
        zIndex: 0,
      }} />
    </AbsoluteFill>
  );
};
