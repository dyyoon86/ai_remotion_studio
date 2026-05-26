import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

const ITEMS = [
  { num: "01", heading: "목표 설정", body: "명확한 KPI와 성공 기준을 정의합니다" },
  { num: "02", heading: "데이터 수집", body: "다양한 소스에서 양질의 데이터를 확보합니다" },
  { num: "03", heading: "모델 학습", body: "최적화된 AI 모델을 훈련하고 검증합니다" },
  { num: "04", heading: "배포 및 모니터링", body: "실시간 성능 추적으로 품질을 유지합니다" },
];

export const NumberListTemplate: React.FC<Props> = ({
  title = "실행 로드맵",
  subtitle = "성공을 위한 4단계 전략",
  accent = "#e11d48",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerX = interpolate(frame, [0, 16], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 10% 50%, ${accent}18 0%, #020617 55%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
    }}>
      {/* Vertical stripe decoration */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 6,
        background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
      }} />

      {/* Right side glow */}
      <div style={{
        position: "absolute", right: -100, top: "30%",
        width: 500, height: 500,
        borderRadius: 999,
        background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
        filter: "blur(50px)",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 80, left: 100,
        opacity: headerOp, transform: `translateX(${headerX}px)`,
      }}>
        <div style={{
          fontSize: 58, fontWeight: 900, letterSpacing: -2.5,
          background: `linear-gradient(90deg, #fff 0%, ${accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#64748b", marginTop: 8, fontWeight: 400 }}>
          {subtitle}
        </div>
      </div>

      {/* List items */}
      <div style={{
        position: "absolute",
        top: 240, left: 100, right: 120,
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {ITEMS.map((item, i) => {
          const delay = 18 + i * 16;
          const sc = spring({ frame, fps, from: 0, to: 1, config: { damping: 16, stiffness: 120 }, delay });
          const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const slideX = interpolate(frame, [delay, delay + 18], [-120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barWidth = interpolate(frame, [delay + 10, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const localPulse = 1 + Math.sin(frame / 12 + i * 1.2) * 0.04;

          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateX(${slideX}px)`,
              display: "flex", alignItems: "center", gap: 32,
              background: `linear-gradient(90deg, ${accent}10 0%, ${accent}04 100%)`,
              border: `1px solid ${accent}30`,
              borderLeft: `4px solid ${accent}`,
              borderRadius: "0 16px 16px 0",
              padding: "24px 32px",
              position: "relative", overflow: "hidden",
            }}>
              {/* Progress bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0,
                height: 2,
                width: `${barWidth * 100}%`,
                background: `linear-gradient(90deg, ${accent}, ${accent}40)`,
              }} />

              {/* Large number */}
              <div style={{
                fontSize: 72, fontWeight: 900, letterSpacing: -3,
                color: accent,
                opacity: 0.9,
                minWidth: 110,
                lineHeight: 1,
                transform: `scale(${localPulse})`,
                textShadow: `0 0 30px ${accent}60`,
              }}>
                {item.num}
              </div>

              {/* Divider */}
              <div style={{
                width: 2, height: 60, borderRadius: 2,
                background: `linear-gradient(180deg, transparent, ${accent}60, transparent)`,
              }} />

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
                  {item.heading}
                </div>
                <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 400 }}>
                  {item.body}
                </div>
              </div>

              {/* Chevron */}
              <div style={{
                fontSize: 28, color: `${accent}80`,
                fontWeight: 300,
              }}>›</div>
            </div>
          );
        })}
      </div>

      {/* Bottom line */}
      <div style={{
        position: "absolute", bottom: 60, left: 100, right: 120,
        height: 1,
        background: `linear-gradient(90deg, ${accent}80, transparent)`,
        opacity: interpolate(frame, [70, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }} />
    </AbsoluteFill>
  );
};
