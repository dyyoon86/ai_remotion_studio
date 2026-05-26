import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const LogoBrandTemplate: React.FC<Props> = ({
  title = "HECTO",
  subtitle = "미래를 앞서가는 핀테크 혁신",
  accent = "#6366f1",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0–25): glow ring expands
  const ringScale = spring({ frame, fps, from: 0.2, to: 1.6, config: { damping: 18, stiffness: 50, mass: 1.5 } });
  const ringOpacity = interpolate(frame, [0, 10, 45, 55], [0, 0.6, 0.4, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Second ring (delayed)
  const ring2Scale = spring({ frame: Math.max(0, frame - 8), fps, from: 0.2, to: 2.2, config: { damping: 20, stiffness: 40, mass: 2 } });
  const ring2Opacity = interpolate(frame, [8, 18, 50, 60], [0, 0.35, 0.2, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phase 2 (20–45): logo stamp in with bounce
  const logoScale = spring({ frame: Math.max(0, frame - 18), fps, from: 1.4, to: 1, config: { damping: 9, stiffness: 200, mass: 0.8 } });
  const logoOpacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Stamp impact flash
  const stampFlash = interpolate(frame, [18, 24, 30], [0, 0.8, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phase 3 (50–90): tagline typewriter
  const typewriterProgress = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const visibleChars = Math.floor(typewriterProgress * subtitle.length);
  const visibleText = subtitle.slice(0, visibleChars);
  const showCursor = frame >= 50 && frame <= 88;
  const cursorBlink = Math.floor(frame / 7) % 2 === 0;

  const taglineOpacity = interpolate(frame, [48, 54], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Subtle logo glow pulse after reveal
  const logoGlow = frame > 40 ? 0.4 + Math.sin((frame - 40) / 8) * 0.15 : 0;

  // Build initial letter for mark
  const markLetter = title.charAt(0).toUpperCase();

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 50%, #0f0f1a 0%, #060609 70%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    }}>
      {/* Noise grain overlay */}
      <AbsoluteFill style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        opacity: 0.5,
      }} />

      {/* Glow ring 1 */}
      <div style={{
        position: "absolute",
        width: 320,
        height: 320,
        borderRadius: 999,
        border: `1px solid ${accent}`,
        transform: `scale(${ringScale})`,
        opacity: ringOpacity,
        boxShadow: `0 0 30px ${accent}60, inset 0 0 30px ${accent}20`,
      }} />

      {/* Glow ring 2 */}
      <div style={{
        position: "absolute",
        width: 320,
        height: 320,
        borderRadius: 999,
        border: `1px solid ${accent}80`,
        transform: `scale(${ring2Scale})`,
        opacity: ring2Opacity,
      }} />

      {/* Logo mark */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 4,
      }}>
        {/* Stamp flash */}
        <div style={{
          position: "absolute",
          inset: -60,
          borderRadius: 999,
          background: `radial-gradient(circle, ${accent}${Math.round(stampFlash * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Mark circle */}
        <div style={{
          width: 140,
          height: 140,
          borderRadius: 999,
          background: `linear-gradient(135deg, ${accent}30 0%, ${accent}10 100%)`,
          border: `2px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 ${60 * logoGlow}px ${accent}${Math.round(logoGlow * 180).toString(16).padStart(2, "0")}`,
        }}>
          <span style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -2,
            background: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {markLetter}
          </span>
        </div>

        {/* Brand name */}
        <div style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          marginTop: 28,
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: 12,
          textTransform: "uppercase",
          background: `linear-gradient(90deg, #fff 0%, ${accent} 50%, #fff 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          {title}
        </div>

        {/* Tagline typewriter */}
        <div style={{
          marginTop: 20,
          opacity: taglineOpacity,
          fontSize: 22,
          color: "#94a3b8",
          letterSpacing: 1,
          minHeight: 32,
          display: "flex",
          alignItems: "center",
        }}>
          <span>{visibleText}</span>
          {showCursor && (
            <span style={{
              display: "inline-block",
              width: 2,
              height: 22,
              background: accent,
              marginLeft: 2,
              opacity: cursorBlink ? 1 : 0,
              borderRadius: 1,
              boxShadow: `0 0 8px ${accent}`,
            }} />
          )}
        </div>

        {/* Decorative rule below tagline */}
        <div style={{
          marginTop: 24,
          opacity: taglineOpacity * typewriterProgress,
          width: 200,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
        }} />
      </div>
    </AbsoluteFill>
  );
};
