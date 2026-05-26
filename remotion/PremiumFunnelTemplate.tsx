import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const BANDS = [
  { label: "인지", count: "12,400", pct: 1.0 },
  { label: "관심", count: "6,200", pct: 0.72 },
  { label: "고려", count: "2,800", pct: 0.48 },
  { label: "전환", count: "940", pct: 0.28 },
];

export const PremiumFunnelTemplate: React.FC<Props> = ({
  title = "프리미엄 퍼널",
  subtitle = "전환 단계별 성과 분석",
  accent = "#f59e0b",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const headerY = interpolate(frame, [0, 20], [-30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(160deg, #0a0a0f 0%, #0f172a 50%, #1a0a00 100%)",
      fontFamily: "Geist, sans-serif",
      color: "white",
      padding: "72px 120px",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Blueprint grid */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
      }} />

      {/* Header */}
      <div style={{
        opacity: headerOpacity,
        transform: `translateY(${headerY}px)`,
        marginBottom: 56,
        zIndex: 2,
      }}>
        <div style={{ fontSize: 18, color: accent, fontWeight: 700, letterSpacing: 8, textTransform: "uppercase", marginBottom: 12 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>
          {title}
        </div>
      </div>

      {/* Funnel bands */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, zIndex: 2 }}>
        {BANDS.map((band, i) => {
          const delay = 20 + i * 14;
          const fillProgress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 18, stiffness: 80 },
            from: 0,
            to: 1,
          });
          const labelOpacity = interpolate(frame, [delay + 8, delay + 22], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const bandWidth = `${band.pct * 100}%`;
          const fillWidth = `${fillProgress * band.pct * 100}%`;
          const isBottom = i === BANDS.length - 1;

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
              {/* Band */}
              <div style={{
                width: bandWidth,
                height: 76,
                borderRadius: isBottom ? "0 0 12px 12px" : 6,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${accent}30`,
                position: "relative",
                overflow: "hidden",
                transition: "width 0s",
              }}>
                {/* Fill bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, bottom: 0,
                  width: fillWidth,
                  background: i === BANDS.length - 1
                    ? `linear-gradient(90deg, ${accent}, ${accent}dd)`
                    : `linear-gradient(90deg, ${accent}50, ${accent}20)`,
                  borderRadius: "inherit",
                }} />
                {/* Label inside */}
                <div style={{
                  position: "absolute", top: "50%", left: 24,
                  transform: "translateY(-50%)",
                  fontSize: 22, fontWeight: 700, opacity: labelOpacity,
                  zIndex: 2,
                }}>
                  {band.label}
                </div>
                {/* Count right */}
                <div style={{
                  position: "absolute", top: "50%", right: 24,
                  transform: "translateY(-50%)",
                  fontSize: 28, fontWeight: 800, color: accent,
                  opacity: labelOpacity, zIndex: 2,
                }}>
                  {band.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <div style={{
        height: 3, marginTop: 40, zIndex: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }} />
    </AbsoluteFill>
  );
};
