import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const RINGS = [
  { size: 320, tiltX: 70, tiltZ: 0, speed: 1.0 },
  { size: 320, tiltX: 70, tiltZ: 60, speed: 0.75 },
  { size: 320, tiltX: 70, tiltZ: 120, speed: 0.5 },
  { size: 440, tiltX: 20, tiltZ: 30, speed: 0.6 },
  { size: 220, tiltX: 85, tiltZ: 90, speed: 1.2 },
];

export const HologramCoreTemplate: React.FC<Props> = ({
  title = "홀로그램 코어",
  subtitle = "HOLOGRAM CORE SYSTEM",
  accent = "#22d3ee",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalReveal = spring({ frame, fps, config: { damping: 18, stiffness: 60 }, from: 0, to: 1 });
  const coreGlow = 0.6 + Math.sin(frame / 8) * 0.4;
  const scanlineY = ((frame * 4) % 1080);

  const titleOpacity = interpolate(frame, [30, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 90 }, from: 0.7, to: 1 });

  return (
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse at 50% 50%, #001a1f 0%, #000510 70%)",
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Fine grid */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}10 1px, transparent 1px), linear-gradient(90deg, ${accent}10 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: globalReveal,
      }} />

      {/* Scanline overlay */}
      <div style={{
        position: "absolute",
        top: scanlineY - 2,
        left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
        opacity: 0.5,
        pointerEvents: "none",
      }} />

      {/* Rotating rings */}
      {RINGS.map((ring, i) => {
        const rotation = (frame * ring.speed * 2) + i * 30;
        return (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: ring.size, height: ring.size,
            borderRadius: "50%",
            border: `1.5px solid ${accent}${i % 2 === 0 ? "50" : "30"}`,
            transform: `translate(-50%, -50%) rotateX(${ring.tiltX}deg) rotateZ(${ring.tiltZ + rotation}deg)`,
            boxShadow: `0 0 12px ${accent}20`,
            opacity: globalReveal,
          }} />
        );
      })}

      {/* Outer ambient glow */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 600, height: 600,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`,
        filter: "blur(30px)",
        opacity: globalReveal,
      }} />

      {/* Core sphere */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 140, height: 140,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle at 38% 35%, ${accent}cc 0%, ${accent}40 40%, ${accent}10 100%)`,
        boxShadow: `0 0 ${40 + coreGlow * 40}px ${accent}, 0 0 ${80 + coreGlow * 60}px ${accent}60`,
        opacity: globalReveal,
      }} />

      {/* Core inner highlight */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 50, height: 50,
        borderRadius: "50%",
        transform: "translate(-70%, -70%)",
        background: "rgba(255,255,255,0.6)",
        filter: "blur(10px)",
        opacity: globalReveal * 0.8,
      }} />

      {/* Title */}
      <div style={{
        position: "absolute",
        bottom: 100,
        left: 0, right: 0,
        textAlign: "center",
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        zIndex: 10,
      }}>
        <div style={{ fontSize: 14, letterSpacing: 10, color: `${accent}cc`, textTransform: "uppercase", marginBottom: 12 }}>
          {subtitle}
        </div>
        <div style={{
          fontSize: 88, fontWeight: 900, letterSpacing: -3,
          background: `linear-gradient(180deg, #ffffff 0%, ${accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textShadow: "none",
          filter: `drop-shadow(0 0 20px ${accent}80)`,
        }}>
          {title}
        </div>
      </div>

      {/* Corner HUD elements */}
      {([
        { top: 40, left: 40, text: "SYS: ONLINE" },
        { top: 40, right: 40, text: "CORE: 98.7%" },
        { bottom: 40, left: 40, text: "PWR: ████░" },
        { bottom: 40, right: 40, text: "NET: SYNC" },
      ] as Array<{ top?: number; left?: number; right?: number; bottom?: number; text: string }>).map((hud, i) => {
        const { text, ...cssPos } = hud;
        return (
          <div key={i} style={{
            position: "absolute",
            ...cssPos,
            fontSize: 13, color: `${accent}80`, fontWeight: 600, letterSpacing: 3,
            opacity: interpolate(frame, [i * 8 + 10, i * 8 + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            fontVariantNumeric: "tabular-nums",
          }}>
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
