import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const EVENTS = [
  { label: "기획", detail: "Q1 2024", angle: 0 },
  { label: "개발", detail: "Q2 2024", angle: 90 },
  { label: "런칭", detail: "Q3 2024", angle: 180 },
  { label: "성장", detail: "Q4 2024", angle: 270 },
];

export const OrbitTimelineTemplate: React.FC<Props> = ({
  title = "궤도 타임라인",
  subtitle = "프로젝트 여정",
  accent = "#34d399",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const centerScale = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, from: 0, to: 1 });
  const centerOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Orbit ring draws in
  const ringOpacity = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Rotate the whole orbit slowly
  const orbitRotation = interpolate(frame, [0, 90], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const RX = 340; // ellipse horizontal radius
  const RY = 190; // ellipse vertical radius

  return (
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse at 50% 50%, #071a10 0%, #020617 70%)",
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Subtle star field */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(${accent}22 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        backgroundPosition: "30px 30px",
        opacity: 0.6,
      }} />

      {/* Orbit ellipse — drawn as a positioned ring */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: RX * 2, height: RY * 2,
        transform: `translate(-50%, -50%) rotate(${orbitRotation}deg)`,
        border: `2px dashed ${accent}40`,
        borderRadius: "50%",
        opacity: ringOpacity,
      }} />

      {/* Satellite nodes */}
      {EVENTS.map((ev, i) => {
        const angleRad = ((ev.angle + orbitRotation) * Math.PI) / 180;
        const x = Math.cos(angleRad) * RX;
        const y = Math.sin(angleRad) * RY;

        const nodeDelay = 18 + i * 12;
        const nodeScale = spring({ frame: frame - nodeDelay, fps, config: { damping: 12, stiffness: 120 }, from: 0, to: 1 });
        const labelOpacity = interpolate(frame, [nodeDelay + 8, nodeDelay + 24], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        // Nodes at top (y < -60) get label above; others below
        const isTop = Math.sin(angleRad) < -0.3;
        const labelOffset = isTop ? -64 : 56;

        return (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${nodeScale})`,
          }}>
            {/* Dot */}
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 20px ${accent}, 0 0 40px ${accent}60`,
              position: "relative",
            }}>
              {/* Label tag */}
              <div style={{
                position: "absolute",
                top: labelOffset,
                left: "50%",
                transform: "translateX(-50%)",
                opacity: labelOpacity,
                background: `${accent}20`,
                border: `1px solid ${accent}50`,
                borderRadius: 8,
                padding: "8px 16px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>{ev.label}</div>
                <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 2 }}>{ev.detail}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Center node */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${centerScale})`,
        opacity: centerOpacity,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}40 0%, ${accent}10 60%, transparent 100%)`,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 60px ${accent}60`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}>
        <div style={{ fontSize: 13, color: `${accent}99`, letterSpacing: 3, textTransform: "uppercase" }}>NOW</div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        textAlign: "center", zIndex: 2,
        opacity: interpolate(frame, [4, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ fontSize: 20, color: `${accent}99`, letterSpacing: 6, textTransform: "uppercase", marginBottom: 8 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, color: "white" }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
