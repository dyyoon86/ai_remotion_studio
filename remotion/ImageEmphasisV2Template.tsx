import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const ImageEmphasisV2Template: React.FC<Props> = ({
  title = "브랜드의 새로운 시작",
  subtitle = "AI가 만드는 감성적인 영상 콘텐츠",
  accent = "#10b981",
  image,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Left text block
  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const accentBarScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 18, stiffness: 120, mass: 0.8 } });

  const titleY = interpolate(frame, [12, 35], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [12, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subtitleY = interpolate(frame, [28, 50], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [28, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tagOpacity = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagX = interpolate(frame, [45, 60], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Right image: mask reveal from left → right
  const maskReveal = interpolate(frame, [15, 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const imageScale = interpolate(frame, [15, 90], [1.1, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const placeholder = `linear-gradient(160deg, #0f172a 0%, #1e293b 40%, ${accent}25 100%)`;

  const lines = subtitle.split(/ {2,}|\n/);

  return (
    <AbsoluteFill style={{
      background: "#060a0e",
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex",
      flexDirection: "row",
    }}>
      {/* Background texture */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(0deg, ${accent}06 0, ${accent}06 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, ${accent}06 0, ${accent}06 1px, transparent 1px, transparent 60px)`,
      }} />

      {/* LEFT PANEL: text */}
      <div style={{
        width: 760,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px 0 100px",
        position: "relative",
        zIndex: 2,
        opacity: textOpacity,
        flexShrink: 0,
      }}>
        {/* Vertical accent bar */}
        <div style={{
          position: "absolute",
          left: 56,
          top: "50%",
          transform: `translateY(-50%) scaleY(${accentBarScale})`,
          transformOrigin: "top center",
          width: 5,
          height: 220,
          background: `linear-gradient(180deg, ${accent}, ${accent}40)`,
          borderRadius: 3,
          boxShadow: `0 0 20px ${accent}60`,
        }} />

        {/* Category tag */}
        <div style={{
          opacity: tagOpacity,
          transform: `translateX(${tagX}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          alignSelf: "flex-start",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 3,
            color: accent,
            textTransform: "uppercase",
          }}>
            Featured
          </span>
        </div>

        {/* Title */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 70,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: -2.5,
          marginBottom: 28,
          background: `linear-gradient(170deg, #ffffff 0%, ${accent} 120%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 22,
          color: "#6b7280",
          lineHeight: 1.7,
          maxWidth: 480,
        }}>
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* CTA dot row */}
        <div style={{
          marginTop: 48,
          opacity: tagOpacity,
          display: "flex",
          gap: 12,
        }}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} style={{
              width: i === 0 ? 32 : 8,
              height: 8,
              borderRadius: 999,
              background: i === 0 ? accent : `${accent}40`,
            }} />
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: image with mask reveal */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Mask: clip from left */}
        <div style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - maskReveal}% 0 0)`,
        }}>
          {/* Image */}
          <div style={{
            position: "absolute",
            inset: -40,
            backgroundImage: image ? `url(${image})` : placeholder,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${imageScale})`,
            transformOrigin: "center",
          }} />
          {/* Overlay gradient */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${accent}20 0%, transparent 30%, rgba(0,0,0,0.3) 100%)`,
          }} />
        </div>

        {/* Leading edge flash */}
        <div style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${maskReveal}%`,
          width: 4,
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          opacity: maskReveal < 100 ? 1 : 0,
          transform: "translateX(-50%)",
          boxShadow: `0 0 20px ${accent}`,
        }} />

        {/* Accent frame on right edge */}
        <div style={{
          position: "absolute",
          top: 60,
          right: 40,
          bottom: 60,
          width: 3,
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          opacity: 0.5,
          borderRadius: 3,
        }} />
      </div>
    </AbsoluteFill>
  );
};
