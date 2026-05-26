import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const RAY_COUNT = 12;

export const KineticCompactTemplate: React.FC<Props> = ({
  title = "키네틱 버스트",
  subtitle = "고에너지 임팩트",
  accent = "#ef4444",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title burst-snap: fast spring
  const titleScale = spring({ frame, fps, from: 2.2, to: 1, config: { damping: 9, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Chromatic aberration: strong at burst, fades
  const chromaAmt = interpolate(frame, [0, 6, 20], [12, 16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle pill slides up
  const pillY = interpolate(frame, [12, 28], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pillOpacity = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Burst rays: expand from corner, then fade
  const rayProgress = interpolate(frame, [0, 20, 45], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Screen shake: only first 10 frames
  const shakeX = frame < 10 ? (Math.random() - 0.5) * 6 * (1 - frame / 10) : 0;
  const shakeY = frame < 10 ? (Math.random() - 0.5) * 4 * (1 - frame / 10) : 0;

  // Scanlines sweep
  const scanlineOffset = (frame * 3) % 60;

  // Persistent energy: small oscillation on border
  const borderGlow = 0.6 + Math.sin(frame / 4) * 0.4;

  return (
    <AbsoluteFill style={{
      background: "#0c0004",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      {/* Scanline overlay */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${accent}06 2px, ${accent}06 4px)`,
        backgroundPositionY: `${scanlineOffset}px`,
        opacity: 0.8,
        pointerEvents: "none",
      }} />

      {/* Corner burst rays */}
      {Array.from({ length: RAY_COUNT }).map((_, i) => {
        const angle = (i / RAY_COUNT) * 360 - 135; // fan from bottom-left corner
        const rad = (angle * Math.PI) / 180;
        const len = 900 * rayProgress;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 2,
              height: len,
              background: `linear-gradient(180deg, transparent, ${accent}80)`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "bottom center",
              opacity: rayProgress * (0.3 + (i % 3) * 0.1),
              filter: `blur(${i % 2 === 0 ? 1 : 3}px)`,
            }}
          />
        );
      })}

      {/* Secondary corner top-right */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * 90 + 45;
        const len = 600 * rayProgress;
        return (
          <div key={`r${i}`} style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 1,
            height: len,
            background: `linear-gradient(180deg, ${accent}60, transparent)`,
            transform: `rotate(${angle + 90}deg)`,
            transformOrigin: "top center",
            opacity: rayProgress * 0.3,
          }} />
        );
      })}

      {/* Ambient glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${accent}20 0%, transparent 65%)`,
      }} />

      {/* Title with chromatic split */}
      <div style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        transform: `scale(${titleScale})`,
        opacity: titleOpacity,
        marginBottom: 32,
      }}>
        {/* Red channel */}
        <div style={{
          position: "absolute",
          fontSize: 108,
          fontWeight: 900,
          letterSpacing: -3,
          color: "#ff1a1a",
          opacity: 0.45,
          top: 0,
          left: chromaAmt,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          WebkitTextFillColor: "#ff1a1a",
        }}>{title}</div>
        {/* Cyan channel */}
        <div style={{
          position: "absolute",
          fontSize: 108,
          fontWeight: 900,
          letterSpacing: -3,
          color: "#00f0ff",
          opacity: 0.45,
          top: 0,
          left: -chromaAmt,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          WebkitTextFillColor: "#00f0ff",
        }}>{title}</div>
        {/* Main */}
        <div style={{
          position: "relative",
          fontSize: 108,
          fontWeight: 900,
          letterSpacing: -3,
          background: `linear-gradient(135deg, #ffffff 20%, ${accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          whiteSpace: "nowrap",
          textShadow: "none",
          filter: `drop-shadow(0 0 20px ${accent}80)`,
        }}>{title}</div>
      </div>

      {/* Subtitle pill */}
      <div style={{
        zIndex: 10,
        opacity: pillOpacity,
        transform: `translateY(${pillY}px)`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${accent}25, ${accent}10)`,
          border: `1px solid ${accent}60`,
          borderRadius: 999,
          padding: "10px 32px",
          fontSize: 22,
          fontWeight: 600,
          color: "#fff",
          letterSpacing: 1,
          boxShadow: `0 0 24px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
          opacity: borderGlow,
        }}>
          {subtitle}
        </div>
      </div>

      {/* Bottom energy bar */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, transparent, ${accent}, ${accent}80, transparent)`,
        boxShadow: `0 0 20px ${accent}`,
        opacity: borderGlow,
      }} />

      {/* Top energy bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${accent}40, transparent, ${accent}40)`,
        opacity: borderGlow * 0.5,
      }} />
    </AbsoluteFill>
  );
};
