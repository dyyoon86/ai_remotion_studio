import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const StrategicBlueprintTemplate: React.FC<Props> = ({
  title = "전략적 블루프린트",
  subtitle = "STRATEGIC BLUEPRINT",
  accent = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashed measurement lines draw in
  const hLineProgress = interpolate(frame, [10, 42], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const vLineProgress = interpolate(frame, [22, 54], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Corner brackets
  const bracketScale = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 }, from: 0, to: 1 });

  // Central block reveal
  const coreScale = spring({ frame: frame - 40, fps, config: { damping: 12, stiffness: 100 }, from: 0.6, to: 1 });
  const coreOpacity = interpolate(frame, [38, 58], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Subtitle label below
  const subOpacity = interpolate(frame, [56, 72], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const W = 1920;
  const H = 1080;
  const CX = W / 2;
  const CY = H / 2;

  // Annotation ticks
  const tickOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "#020b18",
      fontFamily: "Geist, sans-serif",
      color: accent,
      overflow: "hidden",
    }}>
      {/* Blueprint grid — fine */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}15 1px, transparent 1px), linear-gradient(90deg, ${accent}15 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      {/* Blueprint grid — major */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}30 1px, transparent 1px), linear-gradient(90deg, ${accent}30 1px, transparent 1px)`,
        backgroundSize: "240px 240px",
      }} />

      {/* Horizontal measurement line */}
      <div style={{
        position: "absolute",
        top: CY,
        left: 0,
        height: 1,
        width: `${hLineProgress * 100}%`,
        borderTop: `2px dashed ${accent}70`,
      }} />
      {/* Vertical measurement line */}
      <div style={{
        position: "absolute",
        left: CX,
        top: 0,
        width: 1,
        height: `${vLineProgress * 100}%`,
        borderLeft: `2px dashed ${accent}70`,
      }} />

      {/* Corner brackets */}
      {([
        { top: 60, left: 60, rotateDeg: 0 },
        { top: 60, right: 60, rotateDeg: 90 },
        { bottom: 60, left: 60, rotateDeg: 270 },
        { bottom: 60, right: 60, rotateDeg: 180 },
      ] as Array<{ top?: number; left?: number; right?: number; bottom?: number; rotateDeg: number }>).map((pos, i) => {
        const { rotateDeg, ...cssPos } = pos;
        return (
          <div key={i} style={{
            position: "absolute",
            ...cssPos,
            width: 80, height: 80,
            transform: `scale(${bracketScale}) rotate(${rotateDeg}deg)`,
            transformOrigin: "center",
            borderTop: `3px solid ${accent}`,
            borderLeft: `3px solid ${accent}`,
          }} />
        );
      })}

      {/* Dimension annotations */}
      <div style={{
        position: "absolute", top: CY - 24, left: 40,
        fontSize: 14, fontWeight: 600, letterSpacing: 3,
        opacity: tickOpacity, color: accent,
      }}>
        1920 px
      </div>
      <div style={{
        position: "absolute", left: CX + 12, top: 40,
        fontSize: 14, fontWeight: 600, letterSpacing: 3,
        opacity: tickOpacity, color: accent,
        writingMode: "vertical-rl",
      }}>
        1080 px
      </div>

      {/* Central concept block */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${coreScale})`,
        opacity: coreOpacity,
        width: 560, height: 280,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 60px ${accent}40, inset 0 0 40px ${accent}10`,
        background: `${accent}08`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16,
      }}>
        {/* Cross-hair ticks */}
        {[-1, 1].map((d) => (
          <div key={d} style={{
            position: "absolute",
            top: "50%", left: `${50 + d * 50}%`,
            width: 12, height: 2, background: accent,
            transform: "translateY(-50%)",
          }} />
        ))}
        {[-1, 1].map((d) => (
          <div key={d} style={{
            position: "absolute",
            left: "50%", top: `${50 + d * 50}%`,
            height: 12, width: 2, background: accent,
            transform: "translateX(-50%)",
          }} />
        ))}
        <div style={{ fontSize: 13, letterSpacing: 6, color: `${accent}99`, textTransform: "uppercase" }}>
          CORE CONCEPT
        </div>
        <div style={{
          fontSize: 60, fontWeight: 900, letterSpacing: -2,
          color: "#ffffff",
          textShadow: `0 0 40px ${accent}`,
        }}>
          {title}
        </div>
      </div>

      {/* Subtitle below */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        textAlign: "center", fontSize: 18, letterSpacing: 10,
        color: `${accent}80`, opacity: subOpacity, fontWeight: 600,
        textTransform: "uppercase",
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
