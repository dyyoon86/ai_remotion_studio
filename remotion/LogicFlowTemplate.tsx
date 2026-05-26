import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const LogicFlowTemplate: React.FC<Props> = ({
  title = "논리 흐름도",
  subtitle = "의사결정 구조 분석",
  accent = "#f472b6",
  productA = "성공 경로",
  productB = "대안 경로",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sequential reveal: question → left branch → right branch → connector → conclusion
  const q = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, from: 0, to: 1 });
  const qOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lineAProgress = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineBProgress = interpolate(frame, [24, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const nodeAScale = spring({ frame: frame - 36, fps, config: { damping: 12, stiffness: 110 }, from: 0, to: 1 });
  const nodeBScale = spring({ frame: frame - 40, fps, config: { damping: 12, stiffness: 110 }, from: 0, to: 1 });

  const mergeLineProgress = interpolate(frame, [54, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const conclusionScale = spring({ frame: frame - 68, fps, config: { damping: 10, stiffness: 90 }, from: 0, to: 1 });
  const conclusionOpacity = interpolate(frame, [66, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const LINE_H = 90; // vertical line segment height
  const BRANCH_W = 280; // horizontal offset for branches

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(150deg, #0f0010 0%, #0a0a1a 50%, #000d0a 100%)",
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Grid */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 60, left: 0, right: 0,
        textAlign: "center", zIndex: 3,
        opacity: qOpacity,
      }}>
        <div style={{ fontSize: 16, color: `${accent}99`, letterSpacing: 8, textTransform: "uppercase" }}>{subtitle}</div>
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, marginTop: 8 }}>{title}</div>
      </div>

      {/* Flow chart container — vertically centered */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, marginTop: 40 }}>

        {/* Question / Decision diamond */}
        <div style={{
          transform: `scale(${q})`, opacity: qOpacity,
          width: 280, height: 80,
          background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
          border: `2px solid ${accent}`,
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 700,
          boxShadow: `0 0 40px ${accent}30`,
          position: "relative",
        }}>
          목표를 달성했나요?
          {/* diamond tag */}
          <div style={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            background: accent, color: "#000", fontSize: 11, fontWeight: 800,
            padding: "2px 10px", borderRadius: 4, letterSpacing: 2,
          }}>DECISION</div>
        </div>

        {/* Vertical down from question */}
        <div style={{ width: 2, height: LINE_H * lineAProgress, background: accent, marginTop: 0 }} />

        {/* Branch row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: BRANCH_W - 40 }}>

          {/* Left branch */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* horizontal stub left */}
            <div style={{ width: BRANCH_W * lineAProgress, height: 2, background: accent, alignSelf: "flex-end" }} />
            <div style={{ width: 2, height: LINE_H * lineBProgress, background: accent }} />
            <div style={{ transform: `scale(${nodeAScale})` }}>
              <div style={{
                width: 220, height: 72,
                background: `${accent}18`,
                border: `2px solid ${accent}80`,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: accent,
              }}>
                YES — {productA}
              </div>
            </div>
            {/* merge line down */}
            <div style={{ width: 2, height: LINE_H * mergeLineProgress, background: accent }} />
          </div>

          {/* Right branch */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* horizontal stub right */}
            <div style={{ width: BRANCH_W * lineBProgress, height: 2, background: accent, alignSelf: "flex-start" }} />
            <div style={{ width: 2, height: LINE_H * lineBProgress, background: accent }} />
            <div style={{ transform: `scale(${nodeBScale})` }}>
              <div style={{
                width: 220, height: 72,
                background: "rgba(255,255,255,0.05)",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "#94a3b8",
              }}>
                NO — {productB}
              </div>
            </div>
            {/* merge line down */}
            <div style={{ width: 2, height: LINE_H * mergeLineProgress, background: "#94a3b8" }} />
          </div>
        </div>

        {/* Conclusion block */}
        <div style={{
          transform: `scale(${conclusionScale})`, opacity: conclusionOpacity,
          width: 400, height: 80, marginTop: 0,
          background: `linear-gradient(135deg, ${accent}50, ${accent}20)`,
          border: `2px solid ${accent}`,
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 800,
          boxShadow: `0 0 60px ${accent}50`,
          letterSpacing: -0.5,
        }}>
          최종 결론 도출
        </div>
      </div>
    </AbsoluteFill>
  );
};
