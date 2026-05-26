import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

// Radial positions for 4 clones: top, right, bottom, left
const CLONE_ANGLES = [270, 0, 90, 180]; // degrees
const CLONE_DISTANCE = 260;

export const LogoCloneTemplate: React.FC<Props> = ({
  title = "LOGO",
  subtitle = "분신술 전개",
  accent = "#a855f7",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0-30): clones fan out
  // Phase 2 (50-75): clones return
  // Phase 3 (75-90): flash and single

  const fanOut = spring({ frame, fps, from: 0, to: 1, config: { damping: 10, stiffness: 90 } });
  const returnProgress = spring({ frame: frame - 50, fps, from: 0, to: 1, config: { damping: 12, stiffness: 140 } });

  const isFanning = frame < 50;
  const cloneDistance = isFanning
    ? fanOut * CLONE_DISTANCE
    : CLONE_DISTANCE * (1 - returnProgress);

  // Flash on return completion
  const flashOpacity = interpolate(frame, [72, 76, 84], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const masterScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 12, stiffness: 100 } });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [20, 40], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const LogoBadge = ({
    opacity, scale, extraStyle,
  }: { opacity: number; scale: number; extraStyle?: React.CSSProperties }) => (
    <div style={{
      width: 120,
      height: 120,
      borderRadius: 28,
      background: `linear-gradient(135deg, ${accent}40, ${accent}20)`,
      border: `2px solid ${accent}80`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      transform: `scale(${scale})`,
      boxShadow: `0 0 30px ${accent}60, inset 0 1px 0 rgba(255,255,255,0.1)`,
      ...extraStyle,
    }}>
      <span style={{
        fontSize: 36,
        fontWeight: 900,
        background: `linear-gradient(135deg, #fff, ${accent})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: -1,
      }}>
        {title.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );

  return (
    <AbsoluteFill style={{
      background: "#080812",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "Geist, sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      {/* Background aura */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at 50% 45%, ${accent}18 0%, transparent 55%)`,
      }} />

      {/* Geometric overlay */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${accent}05 0deg, transparent 1deg, transparent 29deg, ${accent}05 30deg)`,
        opacity: 0.5,
      }} />

      {/* Flash burst */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at 50% 45%, ${accent}70 0%, transparent 50%)`,
        opacity: flashOpacity,
        filter: "blur(10px)",
      }} />

      {/* Clones */}
      {CLONE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = Math.cos(rad) * cloneDistance;
        const cy = Math.sin(rad) * cloneDistance;
        const phaseDelay = i * 4;
        const cloneOpacity = interpolate(
          frame,
          [phaseDelay, phaseDelay + 15, 72, 80],
          [0, 0.7, 0.7, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const glowPulse = 0.5 + Math.sin((frame + i * 20) / 6) * 0.3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "42%",
              transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`,
              zIndex: 4,
              filter: `drop-shadow(0 0 ${20 * glowPulse}px ${accent})`,
            }}
          >
            <LogoBadge opacity={cloneOpacity} scale={0.8} />
          </div>
        );
      })}

      {/* Master logo */}
      <div style={{
        position: "relative",
        zIndex: 10,
        transform: `scale(${masterScale})`,
        filter: `drop-shadow(0 0 40px ${accent}80)`,
        marginBottom: 60,
      }}>
        <LogoBadge
          opacity={1}
          scale={1.2}
          extraStyle={{
            width: 160,
            height: 160,
            borderRadius: 36,
            boxShadow: `0 0 60px ${accent}60, 0 0 100px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        />
      </div>

      {/* Title text */}
      <div style={{
        position: "absolute",
        bottom: 160,
        fontSize: 72,
        fontWeight: 900,
        letterSpacing: -2,
        background: `linear-gradient(135deg, #ffffff 30%, ${accent} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        zIndex: 10,
        opacity: masterScale,
      }}>
        {title}
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute",
        bottom: 100,
        fontSize: 26,
        fontWeight: 400,
        color: `${accent}aa`,
        letterSpacing: 2,
        textTransform: "uppercase",
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
        zIndex: 10,
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
