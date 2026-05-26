import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const ORIGINS: Array<{ x: number; y: number; rotate: number }> = [
  { x: -900, y: -300, rotate: -25 },
  { x: 900, y: -200, rotate: 20 },
  { x: -800, y: 400, rotate: -15 },
  { x: 700, y: 350, rotate: 18 },
  { x: -600, y: 0, rotate: -30 },
  { x: 800, y: -350, rotate: 22 },
  { x: 0, y: -500, rotate: -10 },
  { x: -700, y: 300, rotate: 28 },
];

export const KineticTypoTemplate: React.FC<Props> = ({
  title = "당신의 브랜드가 빛나는 순간",
  subtitle = "AI 영상 자동화 솔루션",
  accent = "#22d3ee",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = title.split(/\s+/);

  const subtitleOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [70, 85], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "#030712",
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Noise texture overlay */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(ellipse at 30% 60%, ${accent}15 0%, transparent 50%),
                          radial-gradient(ellipse at 70% 30%, ${accent}10 0%, transparent 45%)`,
      }} />

      {/* Horizontal rule decoration */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
        transform: "translateY(-80px)",
      }} />

      {/* Words */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 20px",
        maxWidth: 1400,
        zIndex: 2,
        padding: "0 80px",
      }}>
        {words.map((word, idx) => {
          const origin = ORIGINS[idx % ORIGINS.length];
          const stagger = idx * 7;
          const progress = spring({
            frame: Math.max(0, frame - stagger),
            fps,
            from: 0,
            to: 1,
            config: { damping: 11, stiffness: 90, mass: 1.2 },
          });
          // Bounce weight: slight overshoot then settle
          const tx = origin.x * (1 - progress);
          const ty = origin.y * (1 - progress);
          const rot = origin.rotate * (1 - progress);
          const wobble = progress > 0.85
            ? Math.sin((frame - stagger - 20) * 0.6) * 1.5 * (1 - Math.min(1, (frame - stagger - 20) / 18))
            : 0;

          const isAccentWord = idx % 3 === 1;

          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                fontSize: 96,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -3,
                transform: `translate(${tx}px, ${ty}px) rotate(${rot + wobble}deg)`,
                background: isAccentWord
                  ? `linear-gradient(135deg, ${accent}, #fff)`
                  : "linear-gradient(180deg, #fff 40%, #9ca3af 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isAccentWord ? `0 0 60px ${accent}60` : "none",
                willChange: "transform",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute",
        bottom: 120,
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        zIndex: 2,
      }}>
        <div style={{ width: 40, height: 2, background: accent, borderRadius: 2 }} />
        <span style={{ fontSize: 30, fontWeight: 400, color: "#94a3b8", letterSpacing: 2 }}>
          {subtitle}
        </span>
        <div style={{ width: 40, height: 2, background: accent, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};
