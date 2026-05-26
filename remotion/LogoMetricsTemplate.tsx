import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const METRICS = [
  { label: "성장률", value: 247, unit: "%" },
  { label: "활성 사용자", value: 1840, unit: "K" },
  { label: "만족도", value: 98, unit: "%" },
];

export const LogoMetricsTemplate: React.FC<Props> = ({
  title = "BRAND",
  subtitle = "핵심 지표 요약",
  accent = "#10b981",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10, stiffness: 100 } });
  const badgeOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dividerWidth = interpolate(frame, [15, 35], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerHeight = interpolate(frame, [15, 40], [0, 340], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleInitial = title.charAt(0).toUpperCase();

  return (
    <AbsoluteFill style={{
      background: "#060d0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      {/* Background gradient */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${accent}12 0%, transparent 60%)`,
      }} />

      {/* Subtle noise texture via repeating gradient */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${accent}04 3px, ${accent}04 4px)`,
        opacity: 0.5,
      }} />

      {/* Main layout */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        width: 1400,
        position: "relative",
        zIndex: 5,
      }}>
        {/* LEFT: Logo badge */}
        <div style={{
          flex: "0 0 500px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
        }}>
          {/* Large accent badge */}
          <div style={{
            width: 220,
            height: 220,
            borderRadius: 44,
            background: `linear-gradient(135deg, ${accent}30 0%, ${accent}10 100%)`,
            border: `3px solid ${accent}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 80px ${accent}40, 0 0 160px ${accent}15, inset 0 2px 0 rgba(255,255,255,0.08)`,
          }}>
            <span style={{
              fontSize: 100,
              fontWeight: 900,
              background: `linear-gradient(135deg, #ffffff 0%, ${accent} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              letterSpacing: -4,
            }}>
              {titleInitial}
            </span>
          </div>

          <div style={{
            marginTop: 24,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: -1,
            background: `linear-gradient(135deg, #ffffff, ${accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {title}
          </div>
          <div style={{
            marginTop: 8,
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}>
            {subtitle}
          </div>
        </div>

        {/* CENTER: Vertical divider */}
        <div style={{
          width: dividerWidth,
          height: dividerHeight,
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 16px ${accent}80`,
          flexShrink: 0,
          alignSelf: "center",
        }} />

        {/* RIGHT: Metric rows */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          paddingLeft: 60,
        }}>
          {METRICS.map((metric, i) => {
            const rowDelay = 30 + i * 12;
            const rowOpacity = interpolate(frame, [rowDelay, rowDelay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const rowX = interpolate(frame, [rowDelay, rowDelay + 18], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            // Animated counter
            const countEnd = rowDelay + 30;
            const rawCount = interpolate(frame, [rowDelay, countEnd], [0, metric.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const displayCount = Math.floor(rawCount);

            const barProgress = interpolate(frame, [rowDelay + 5, countEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                opacity: rowOpacity,
                transform: `translateX(${rowX}px)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>
                    {metric.label}
                  </span>
                  <span style={{
                    fontSize: 48,
                    fontWeight: 900,
                    letterSpacing: -2,
                    background: `linear-gradient(135deg, #fff 30%, ${accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                  }}>
                    {displayCount.toLocaleString()}
                    <span style={{ fontSize: 26, WebkitTextFillColor: accent, fontWeight: 700 }}>{metric.unit}</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${barProgress * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${accent}80, ${accent})`,
                    boxShadow: `0 0 8px ${accent}`,
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
