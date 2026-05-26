import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

// Deterministic glyph columns — no random; offsets driven by frame
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ0123456789@#$%&";
const COLUMNS = [
  { x: 80,  speed: 1.0, glyphCount: 18, delay: 0  },
  { x: 240, speed: 0.8, glyphCount: 14, delay: 3  },
  { x: 400, speed: 1.2, glyphCount: 20, delay: 1  },
  { x: 560, speed: 0.9, glyphCount: 16, delay: 5  },
  { x: 720, speed: 1.1, glyphCount: 22, delay: 2  },
  { x: 880, speed: 0.7, glyphCount: 12, delay: 4  },
  { x: 1040, speed: 1.3, glyphCount: 18, delay: 0 },
  { x: 1200, speed: 0.85, glyphCount: 16, delay: 6 },
  { x: 1360, speed: 1.0, glyphCount: 20, delay: 3 },
  { x: 1520, speed: 1.15, glyphCount: 14, delay: 1 },
  { x: 1680, speed: 0.95, glyphCount: 18, delay: 5 },
  { x: 1840, speed: 0.75, glyphCount: 22, delay: 2 },
];

const GLYPH_H = 44;

function getGlyph(colIdx: number, rowIdx: number, frame: number, speed: number): string {
  const idx = (colIdx * 17 + rowIdx * 7 + Math.floor(frame * speed * 0.4)) % GLYPHS.length;
  return GLYPHS[Math.abs(idx) % GLYPHS.length];
}

export const CinematicMatrixTemplate: React.FC<Props> = ({
  title = "시네마틱 매트릭스",
  subtitle = "CINEMATIC MATRIX",
  accent = "#00ff41",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Letterbox bars slide in from top and bottom
  const barH = interpolate(frame, [0, 22], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Rain columns fade in
  const rainOpacity = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title reveal
  const titleOpacity = interpolate(frame, [36, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleSpacing = interpolate(frame, [36, 60], [40, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 36, fps, config: { damping: 14, stiffness: 80 }, from: 1.2, to: 1 });

  // Subtitle
  const subOpacity = interpolate(frame, [58, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Vignette pulse
  const vignetteIntensity = 0.7 + Math.sin(frame / 12) * 0.1;

  return (
    <AbsoluteFill style={{
      background: "#000000",
      fontFamily: "Geist, sans-serif",
      color: accent,
      overflow: "hidden",
    }}>
      {/* Falling character columns */}
      <div style={{ position: "absolute", inset: 0, opacity: rainOpacity }}>
        {COLUMNS.map((col, ci) => {
          const scrollOffset = (frame * col.speed * GLYPH_H * 0.12 + col.delay * GLYPH_H * 2);
          return (
            <div key={ci} style={{
              position: "absolute",
              left: col.x,
              top: 0,
              width: 36,
              height: "100%",
              overflow: "hidden",
            }}>
              <div style={{
                transform: `translateY(${-scrollOffset % (col.glyphCount * GLYPH_H)}px)`,
              }}>
                {Array.from({ length: col.glyphCount + 4 }, (_, ri) => {
                  const isHead = ri === col.glyphCount - 1;
                  const fadeFactor = ri / col.glyphCount;
                  return (
                    <div key={ri} style={{
                      height: GLYPH_H,
                      lineHeight: `${GLYPH_H}px`,
                      fontSize: 28,
                      fontWeight: isHead ? 700 : 400,
                      color: isHead ? "#ffffff" : accent,
                      opacity: isHead ? 1 : Math.max(0.05, fadeFactor * 0.7),
                      textShadow: isHead ? `0 0 12px #ffffff, 0 0 4px ${accent}` : `0 0 6px ${accent}`,
                      textAlign: "center",
                    }}>
                      {getGlyph(ci, ri, frame, col.speed)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vignette overlay */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
        pointerEvents: "none",
      }} />

      {/* Green tint wash */}
      <AbsoluteFill style={{
        background: `${accent}05`,
        pointerEvents: "none",
      }} />

      {/* Letterbox — top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: barH,
        background: "#000000",
        zIndex: 8,
      }} />
      {/* Letterbox — bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: barH,
        background: "#000000",
        zIndex: 8,
      }} />

      {/* Center title */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: 10,
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
      }}>
        <div style={{
          fontSize: 100, fontWeight: 900,
          letterSpacing: titleSpacing,
          color: "#ffffff",
          textShadow: `0 0 40px ${accent}, 0 0 80px ${accent}60, 0 0 2px #fff`,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}>
          {title}
        </div>

        {/* Accent underline */}
        <div style={{
          width: interpolate(frame, [50, 68], [0, 480], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          marginTop: 16,
          boxShadow: `0 0 12px ${accent}`,
        }} />

        <div style={{
          fontSize: 18, letterSpacing: 10, marginTop: 20,
          color: `${accent}cc`, opacity: subOpacity,
          textTransform: "uppercase",
        }}>
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
