import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const LogoDualSnapTemplate: React.FC<Props> = ({
  title = "듀얼 스냅",
  subtitle = "정면 충돌",
  accent = "#f59e0b",
  productA = "Brand A",
  productB = "Brand B",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Left card snaps from off-screen left
  const leftX = spring({ frame: frame - 0, fps, from: -800, to: 0, config: { damping: 14, stiffness: 120 } });
  // Right card snaps from off-screen right
  const rightX = spring({ frame: frame - 0, fps, from: 800, to: 0, config: { damping: 14, stiffness: 120 } });

  // VS flash: fires when both are close to center (~frame 18-28)
  const flashOpacity = interpolate(frame, [18, 24, 30], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vsScale = spring({ frame: frame - 10, fps, from: 0, to: 1, config: { damping: 10, stiffness: 200 } });
  const vsOpacity = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [35, 55], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle bg pulse post-snap
  const bgGlow = interpolate(frame, [18, 30, 50], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cardStyle = (bg: string): React.CSSProperties => ({
    width: 440,
    height: 340,
    borderRadius: 24,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    boxShadow: `0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
    border: `1px solid rgba(255,255,255,0.08)`,
  });

  const brandTextStyle: React.CSSProperties = {
    fontSize: 64,
    fontWeight: 900,
    letterSpacing: -2,
    color: "#ffffff",
    lineHeight: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 500,
    color: "rgba(255,255,255,0.5)",
    marginTop: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
  };

  return (
    <AbsoluteFill style={{
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Flash burst on impact */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at center, ${accent}60 0%, transparent 60%)`,
        opacity: flashOpacity,
        filter: "blur(20px)",
      }} />
      <AbsoluteFill style={{
        background: `radial-gradient(circle at center, #ffffff30 0%, transparent 40%)`,
        opacity: flashOpacity * 0.8,
      }} />

      {/* Ongoing glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 70% 40% at center, ${accent}15 0%, transparent 70%)`,
        opacity: bgGlow,
      }} />

      {/* Cards row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        position: "relative",
        zIndex: 5,
      }}>
        {/* Product A card */}
        <div style={{ transform: `translateX(${leftX}px)` }}>
          <div style={cardStyle(`linear-gradient(135deg, #1e1e2e 0%, #16162a 100%)`)}>
            <div style={{ ...brandTextStyle, background: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {productA}
            </div>
            <div style={labelStyle}>Product A</div>
          </div>
        </div>

        {/* VS divider */}
        <div style={{
          width: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: vsOpacity,
          transform: `scale(${vsScale})`,
          zIndex: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 2,
            height: 80,
            background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 12px ${accent}`,
          }} />
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: accent,
            letterSpacing: -1,
            padding: "12px 0",
            textShadow: `0 0 20px ${accent}, 0 0 40px ${accent}80`,
          }}>VS</div>
          <div style={{
            width: 2,
            height: 80,
            background: `linear-gradient(180deg, ${accent}, transparent)`,
            boxShadow: `0 0 12px ${accent}`,
          }} />
        </div>

        {/* Product B card */}
        <div style={{ transform: `translateX(${rightX}px)` }}>
          <div style={cardStyle(`linear-gradient(135deg, #1e2a1e 0%, #162616 100%)`)}>
            <div style={{ ...brandTextStyle, background: `linear-gradient(135deg, #fff 0%, #34d399 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {productB}
            </div>
            <div style={labelStyle}>Product B</div>
          </div>
        </div>
      </div>

      {/* Subtitle below */}
      <div style={{
        position: "absolute",
        bottom: 100,
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        fontSize: 28,
        fontWeight: 400,
        color: "rgba(255,255,255,0.5)",
        letterSpacing: 1,
        zIndex: 5,
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
