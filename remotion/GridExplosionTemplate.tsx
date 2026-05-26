import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const GRID_SIZE = 4;
const TILE_SIZE = 100;
const GAP = 12;

export const GridExplosionTemplate: React.FC<Props> = ({
  title = "그리드 익스플로전",
  subtitle = "AI가 만드는 폭발적인 인트로",
  accent = "#f97316",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const col = i % GRID_SIZE;
    const row = Math.floor(i / GRID_SIZE);
    const cx = col - (GRID_SIZE - 1) / 2;
    const cy = row - (GRID_SIZE - 1) / 2;
    const dist = Math.sqrt(cx * cx + cy * cy);
    const delay = dist * 3;

    // Phase 1 (0–30): explode outward
    const explodeProgress = spring({
      frame: Math.max(0, frame - delay),
      fps,
      from: 0,
      to: 1,
      config: { damping: 8, stiffness: 120 },
    });
    // Phase 2 (50–80): settle back inward
    const settleProgress = spring({
      frame: Math.max(0, frame - 50 - delay * 0.4),
      fps,
      from: 0,
      to: 1,
      config: { damping: 14, stiffness: 180 },
    });

    const explodeDist = 340 * (dist / 2.83);
    const tx = cx / Math.max(dist, 0.01) * explodeDist * explodeProgress * (1 - settleProgress);
    const ty = cy / Math.max(dist, 0.01) * explodeDist * explodeProgress * (1 - settleProgress);
    const rotation = explodeProgress * (1 - settleProgress) * (cx > 0 ? 35 : -35) * (dist / 2.83);
    const tileOpacity = explodeProgress;
    const tileScale = 0.4 + explodeProgress * 0.6 - settleProgress * 0.15;

    return { tx, ty, rotation, opacity: tileOpacity, scale: tileScale, col, row, i };
  });

  const titleOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleScale = spring({ frame: Math.max(0, frame - 60), fps, from: 0.7, to: 1, config: { damping: 14 } });

  const totalTile = TILE_SIZE + GAP;
  const gridW = GRID_SIZE * totalTile - GAP;
  const gridH = GRID_SIZE * totalTile - GAP;

  return (
    <AbsoluteFill style={{
      background: "#050505",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Geist, sans-serif", color: "white",
    }}>
      {/* Background vignette */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center, ${accent}18 0%, #050505 65%)`,
      }} />

      {/* Grid tiles */}
      <div style={{ position: "relative", width: gridW, height: gridH }}>
        {tiles.map(({ tx, ty, rotation, opacity, scale, col, row, i }) => {
          const colorMix = (i / (GRID_SIZE * GRID_SIZE));
          const tileColor = colorMix > 0.5 ? accent : `${accent}99`;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: col * totalTile,
                top: row * totalTile,
                width: TILE_SIZE,
                height: TILE_SIZE,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${tileColor}, ${tileColor}55)`,
                border: `1px solid ${accent}50`,
                boxShadow: `0 0 20px ${accent}40`,
                opacity,
                transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(${scale})`,
              }}
            />
          );
        })}
      </div>

      {/* Title overlay */}
      <div style={{
        position: "absolute",
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        zIndex: 10,
      }}>
        <div style={{
          fontSize: 80, fontWeight: 900, letterSpacing: -3,
          background: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textAlign: "center",
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 28, color: "#9ca3af", marginTop: 16, letterSpacing: 0.5,
        }}>
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
