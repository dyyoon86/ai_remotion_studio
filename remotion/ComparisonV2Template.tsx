import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const ComparisonV2Template: React.FC<Props> = ({
  title = "비교 분석",
  subtitle = "수직 비교",
  accent = "#3b82f6",
  productA = "Product A",
  productB = "Product B",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Top card slides from top
  const topY = spring({ frame, fps, from: -300, to: 0, config: { damping: 14, stiffness: 110 } });
  // Bottom card slides from bottom
  const bottomY = spring({ frame, fps, from: 300, to: 0, config: { damping: 14, stiffness: 110 } });

  // Center divider line draws across (left to right)
  const lineWidth = interpolate(frame, [18, 45], [0, 1920], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineOpacity = interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title appears after divider
  const titleOpacity = interpolate(frame, [38, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 38, fps, from: 0.8, to: 1, config: { damping: 12, stiffness: 120 } });

  // Stats count up
  const statA = Math.floor(interpolate(frame, [25, 60], [0, 94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const statB = Math.floor(interpolate(frame, [30, 65], [0, 87], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Accent flash on center label
  const labelFlash = interpolate(frame, [45, 50, 58], [0, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const halfH = 540; // 1080 / 2

  const CardContent = ({
    brand, stat, unit, side,
  }: { brand: string; stat: number; unit: string; side: "top" | "bottom" }) => {
    const isTop = side === "top";
    return (
      <div style={{
        width: "100%",
        height: halfH,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 120px",
        background: isTop
          ? `linear-gradient(180deg, #0d1117 0%, #111827 100%)`
          : `linear-gradient(0deg, #0d1117 0%, #0f1923 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle corner accent */}
        <div style={{
          position: "absolute",
          [isTop ? "top" : "bottom"]: 0,
          [isTop ? "right" : "left"]: 0,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`,
          filter: "blur(40px)",
        }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />

        {/* Brand name */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: `${accent}99`,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            {isTop ? "PRODUCT A" : "PRODUCT B"}
          </div>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: -3,
            background: `linear-gradient(135deg, #ffffff 40%, ${isTop ? accent : "#94a3b8"} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}>
            {brand}
          </div>
        </div>

        {/* Stat */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "right" }}>
          <div style={{
            fontSize: 100,
            fontWeight: 900,
            letterSpacing: -4,
            color: isTop ? accent : "#64748b",
            lineHeight: 1,
            textShadow: isTop ? `0 0 40px ${accent}60` : "none",
          }}>
            {stat}
            <span style={{ fontSize: 40, fontWeight: 700 }}>{unit}</span>
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 500,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 4,
          }}>
            퍼포먼스 점수
          </div>
          {/* Mini bar */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{
              width: `${stat}%`,
              height: "100%",
              background: isTop
                ? `linear-gradient(90deg, ${accent}80, ${accent})`
                : `linear-gradient(90deg, #64748b80, #64748b)`,
              borderRadius: 2,
            }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      {/* Top half: Product A */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: halfH,
        transform: `translateY(${topY}px)`,
        zIndex: 2,
      }}>
        <CardContent brand={productA} stat={statA} unit="%" side="top" />
      </div>

      {/* Bottom half: Product B */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: halfH,
        transform: `translateY(${bottomY}px)`,
        zIndex: 2,
      }}>
        <CardContent brand={productB} stat={statB} unit="%" side="bottom" />
      </div>

      {/* Center divider line */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        width: lineWidth,
        height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}80, ${accent}40)`,
        boxShadow: `0 0 16px ${accent}, 0 0 32px ${accent}60`,
        transform: "translateY(-50%)",
        opacity: lineOpacity,
        zIndex: 10,
      }} />

      {/* Center label */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${titleScale})`,
        zIndex: 15,
        opacity: titleOpacity,
        textAlign: "center",
      }}>
        <div style={{
          background: `linear-gradient(135deg, #0d1117ee, #111827ee)`,
          border: `2px solid ${accent}`,
          borderRadius: 16,
          padding: "14px 40px",
          boxShadow: `0 0 40px ${accent}${Math.floor(labelFlash * 255).toString(16).padStart(2, "0")}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: -0.5,
            background: `linear-gradient(135deg, #ffffff, ${accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 2,
          }}>
            {subtitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
