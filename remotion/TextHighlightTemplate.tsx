import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

export const TextHighlightTemplate: React.FC<Props> = ({
  title = "이 부분이 핵심입니다",
  subtitle = "포인트 강조",
  accent = "#fbbf24",
}) => {
  const frame = useCurrentFrame();
  const words = title.split(/\s+/);
  const PER_WORD = 8;

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #0a0118 0%, #020617 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", fontFamily: "Geist, sans-serif", color: "white", padding: 80,
    }}>
      {/* Decorative corner brackets */}
      <div style={{ position: "absolute", top: 80, left: 80, width: 60, height: 60, borderTop: `4px solid ${accent}`, borderLeft: `4px solid ${accent}` }} />
      <div style={{ position: "absolute", top: 80, right: 80, width: 60, height: 60, borderTop: `4px solid ${accent}`, borderRight: `4px solid ${accent}` }} />
      <div style={{ position: "absolute", bottom: 80, left: 80, width: 60, height: 60, borderBottom: `4px solid ${accent}`, borderLeft: `4px solid ${accent}` }} />
      <div style={{ position: "absolute", bottom: 80, right: 80, width: 60, height: 60, borderBottom: `4px solid ${accent}`, borderRight: `4px solid ${accent}` }} />

      <div style={{
        fontSize: 24, color: accent, fontWeight: 700, letterSpacing: 8,
        textTransform: "uppercase", marginBottom: 36,
        opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        {subtitle}
      </div>

      <div style={{
        fontSize: 86, fontWeight: 900, letterSpacing: -2,
        textAlign: "center", lineHeight: 1.1, maxWidth: 1500,
        display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em",
      }}>
        {words.map((word, i) => {
          const start = i * PER_WORD;
          const opacity = interpolate(frame, [start, start + 6], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [start, start + 6], [16, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const isLast = i === words.length - 1;
          const highlightProgress = interpolate(
            frame, [start + 6, start + 18], [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <span key={i} style={{
              opacity, transform: `translateY(${y}px)`,
              position: "relative", display: "inline-block",
              color: isLast ? "#0a0118" : "#fff",
              zIndex: 1, padding: "0 0.1em",
            }}>
              {isLast && (
                <span style={{
                  position: "absolute", inset: "10% -4% 5% -4%",
                  background: accent, borderRadius: 8, zIndex: -1,
                  transform: `scaleX(${highlightProgress})`,
                  transformOrigin: "left center",
                  boxShadow: `0 0 40px ${accent}80`,
                }} />
              )}
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
