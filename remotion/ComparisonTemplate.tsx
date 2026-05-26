import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  productA?: string;
  productB?: string;
};

export const ComparisonTemplate: React.FC<Props> = ({
  title = "비교 분석",
  subtitle = "어느 쪽이 우승할까?",
  accent = "#8b5cf6",
  productA = "Product A",
  productB = "Product B",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftX = spring({ frame, fps, config: { damping: 14 }, from: -400, to: 0 });
  const rightX = spring({ frame: frame - 8, fps, config: { damping: 14 }, from: 400, to: 0 });

  const vsScale = spring({
    frame: frame - 24,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 180 },
  });

  const crownOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0f172a 0%, #020617 60%, #1e1b4b 100%)",
      fontFamily: "Geist, sans-serif",
      color: "white",
      padding: 80,
    }}>
      {/* Subtle grid */}
      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        opacity: 0.5,
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 60, position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 22, color: accent, fontWeight: 600, letterSpacing: 6, textTransform: "uppercase", opacity: subtitleOpacity }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 16, letterSpacing: -2 }}>
          {title}
        </div>
      </div>

      {/* Two columns + VS */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 60, flex: 1 }}>
        {/* Left */}
        <div style={{
          flex: 1, transform: `translateX(${leftX}px)`,
          background: "rgba(15,23,42,0.7)", border: `2px solid ${accent}40`,
          borderRadius: 28, padding: 56, textAlign: "center",
          boxShadow: `0 20px 60px -20px ${accent}40`,
        }}>
          <div style={{ fontSize: 28, color: "#94a3b8", marginBottom: 16 }}>Option A</div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>{productA}</div>
        </div>

        {/* VS */}
        <div style={{
          transform: `scale(${vsScale})`,
          width: 140, height: 140, borderRadius: 999,
          background: `linear-gradient(135deg, ${accent}, #6366f1)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56, fontWeight: 900, letterSpacing: -2,
          boxShadow: `0 0 80px ${accent}80, inset 0 0 20px rgba(255,255,255,0.2)`,
        }}>VS</div>

        {/* Right */}
        <div style={{
          flex: 1, transform: `translateX(${rightX}px)`,
          background: "rgba(15,23,42,0.7)", border: `2px solid ${accent}40`,
          borderRadius: 28, padding: 56, textAlign: "center",
          boxShadow: `0 20px 60px -20px ${accent}40`,
          position: "relative",
        }}>
          {/* Crown on winner (right) */}
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            fontSize: 80, opacity: crownOpacity, filter: `drop-shadow(0 0 20px ${accent})`,
          }}>👑</div>
          <div style={{ fontSize: 28, color: "#94a3b8", marginBottom: 16 }}>Option B</div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>{productB}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
