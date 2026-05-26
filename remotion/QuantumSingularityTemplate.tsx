import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const QuantumSingularityTemplate: React.FC<Props> = ({
  title = "퀀텀 싱귤래리티",
  subtitle = "특이점을 향한 수렴",
  accent = "#00f5ff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Warp: rings expand outward but also contract toward center in pulses
  const warpProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 8, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [40, 60], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Chromatic aberration offsets oscillate
  const chromaOffset = interpolate(frame, [0, 90], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    * Math.sin(frame / 4);

  // Rings: 6 concentric rings, each with phase offset
  const rings = [320, 480, 600, 720, 840, 960];
  const singularityPulse = 1 + Math.sin(frame / 5) * 0.04;

  return (
    <AbsoluteFill style={{
      background: "#00010a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      {/* Deep space gradient warp */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${accent}18 0%, #000814 50%, #00010a 100%)`,
        transform: `scale(${singularityPulse})`,
      }} />

      {/* Grid distortion overlay */}
      <AbsoluteFill style={{
        backgroundImage: `
          linear-gradient(${accent}08 1px, transparent 1px),
          linear-gradient(90deg, ${accent}08 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        transform: `perspective(800px) rotateX(${interpolate(frame, [0, 90], [15, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg) scale(1.3)`,
        transformOrigin: "center center",
        opacity: 0.7,
      }} />

      {/* Concentric rings */}
      {rings.map((size, i) => {
        const phase = i * 12;
        const ringOpacity = interpolate(
          frame,
          [phase, phase + 20, 80, 90],
          [0, 0.6, 0.6, 0.2],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const ringScale = interpolate(
          frame,
          [phase, phase + 30],
          [0.2, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        ) + Math.sin((frame + phase) / 8) * 0.025;
        const ringBlur = interpolate(i, [0, 5], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `${2 - i * 0.2}px solid ${accent}`,
              opacity: ringOpacity,
              transform: `translate(-50%, -50%) scale(${ringScale})`,
              left: "50%",
              top: "50%",
              filter: `blur(${ringBlur}px) drop-shadow(0 0 ${8 + i * 4}px ${accent})`,
              boxShadow: `inset 0 0 ${20 + i * 10}px ${accent}20`,
            }}
          />
        );
      })}

      {/* Singularity core */}
      <div style={{
        position: "absolute",
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: accent,
        boxShadow: `0 0 60px ${accent}, 0 0 120px ${accent}80, 0 0 200px ${accent}40`,
        transform: `translate(-50%, -50%) scale(${singularityPulse * 1.2})`,
        left: "50%",
        top: "50%",
        zIndex: 5,
      }} />

      {/* Title with chromatic aberration */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", transform: `scale(${titleScale})`, opacity: titleOpacity }}>
        {/* Red channel */}
        <div style={{
          position: "absolute",
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: -3,
          color: "#ff003c",
          opacity: 0.5,
          top: 0,
          left: `${chromaOffset}px`,
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          WebkitTextFillColor: "#ff003c",
        }}>
          {title}
        </div>
        {/* Cyan channel */}
        <div style={{
          position: "absolute",
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: -3,
          color: "#00f5ff",
          opacity: 0.5,
          top: 0,
          left: `${-chromaOffset}px`,
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          WebkitTextFillColor: accent,
        }}>
          {title}
        </div>
        {/* Main layer */}
        <div style={{
          position: "relative",
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: -3,
          background: `linear-gradient(135deg, #ffffff 40%, ${accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          whiteSpace: "nowrap",
        }}>
          {title}
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 32,
        fontWeight: 400,
        color: `${accent}cc`,
        marginTop: 28,
        letterSpacing: 2,
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        zIndex: 10,
        textTransform: "uppercase",
      }}>
        {subtitle}
      </div>

      {/* Warp progress indicator */}
      <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: 200,
        height: 2,
        background: "#ffffff15",
        borderRadius: 1,
        zIndex: 10,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${warpProgress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${accent}, #ffffff)`,
          boxShadow: `0 0 8px ${accent}`,
          transition: "width 0s",
        }} />
      </div>
    </AbsoluteFill>
  );
};
