import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

export const IntroTemplate: React.FC<Props> = ({
  title = "오늘의 영상",
  subtitle = "AI가 자동 분석한 결과를 만나보세요",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame, fps, from: 0.8, to: 1,
    config: { damping: 12, stiffness: 100 },
  });
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [18, 36], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subOpacity = interpolate(frame, [18, 36], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Background pulse on accent dot
  const dotScale = 1 + Math.sin(frame / 6) * 0.15;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 50% 40%, ${accent}25 0%, #020617 70%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", fontFamily: "Geist, sans-serif", color: "white",
    }}>
      {/* Decorative diagonal lines */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(-45deg, ${accent}10 0, ${accent}10 2px, transparent 2px, transparent 32px)`,
        opacity: 0.6,
      }} />

      {/* Glow ring */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1100, height: 1100, borderRadius: 999,
        background: `radial-gradient(circle, ${accent}30 0%, transparent 60%)`,
        filter: "blur(40px)",
      }} />

      {/* Pulsing dot */}
      <div style={{
        width: 12, height: 12, borderRadius: 999, background: accent,
        boxShadow: `0 0 30px ${accent}, 0 0 60px ${accent}80`,
        transform: `scale(${dotScale})`, marginBottom: 32, zIndex: 2,
      }} />

      <div style={{
        opacity: titleOpacity, transform: `scale(${scale})`,
        fontSize: 120, fontWeight: 900, letterSpacing: -4,
        textAlign: "center", zIndex: 2, lineHeight: 1,
        background: `linear-gradient(180deg, #fff 0%, ${accent} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        {title}
      </div>

      <div style={{
        opacity: subOpacity, transform: `translateY(${subY}px)`,
        fontSize: 36, fontWeight: 400, color: "#cbd5e1",
        marginTop: 32, letterSpacing: -0.5, zIndex: 2,
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
