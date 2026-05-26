import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  imageUrl?: string;
};

export const ImageCardTemplate: React.FC<Props> = ({
  title = "이미지 카드",
  subtitle = "설명을 입력하세요",
  accent = "#10b981",
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const imgScale = spring({
    frame, fps, from: 1.08, to: 1,
    config: { damping: 200 },
  });

  const cardY = interpolate(frame, [20, 40], [60, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "#020617",
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      {/* Background image / placeholder */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: imgOpacity, transform: `scale(${imgScale})`,
      }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `radial-gradient(circle at 30% 30%, ${accent}40, transparent 50%), radial-gradient(circle at 70% 70%, #6366f140, transparent 50%), linear-gradient(135deg, #1e293b, #0f172a)`,
          }} />
        )}
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 30%, rgba(2,6,23,0.95) 100%)",
        }} />
      </div>

      {/* Bottom card slides up */}
      <div style={{
        position: "absolute", left: 80, right: 80, bottom: 80,
        transform: `translateY(${cardY}px)`, opacity: cardOpacity,
      }}>
        <div style={{
          height: 4, width: 100, background: accent, marginBottom: 24,
          boxShadow: `0 0 16px ${accent}`,
        }} />
        <div style={{
          fontSize: 28, color: accent, fontWeight: 600,
          letterSpacing: 6, textTransform: "uppercase", marginBottom: 16,
        }}>
          {subtitle}
        </div>
        <div style={{
          fontSize: 88, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05,
          maxWidth: 1400,
        }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
