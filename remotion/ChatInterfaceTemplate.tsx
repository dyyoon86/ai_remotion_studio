import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
};

const MESSAGES = [
  { side: "left" as const, name: "사용자", text: "안녕하세요! AI 분석 결과를 알려주세요.", delay: 14 },
  { side: "right" as const, name: "AI", text: "데이터 분석을 완료했습니다. 총 3개의 핵심 인사이트를 발견했습니다.", delay: 30 },
  { side: "left" as const, name: "사용자", text: "가장 중요한 인사이트는 무엇인가요?", delay: 48 },
  { side: "right" as const, name: "AI", text: "전환율이 지난 달 대비 42% 향상되었으며, 이는 목표치를 크게 상회합니다.", delay: 62 },
];

const TYPING_START = 78;

export const ChatInterfaceTemplate: React.FC<Props> = ({
  title = "AI 대화 인터페이스",
  subtitle = "실시간 인사이트를 대화로 확인하세요",
  accent = "#3b82f6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowSc = spring({ frame, fps, from: 0.88, to: 1, config: { damping: 14, stiffness: 100 } });
  const windowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const typingDotPhase = (frame - TYPING_START) % 20;
  const typingOp = interpolate(frame, [TYPING_START, TYPING_START + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 40% 60%, ${accent}18 0%, #020617 60%)`,
      fontFamily: "Geist, sans-serif",
      color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Background mesh */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${accent}10 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* Chat window */}
      <div style={{
        width: 860, height: 720,
        opacity: windowOp,
        transform: `scale(${windowSc})`,
        display: "flex", flexDirection: "column",
        borderRadius: 24,
        border: `1px solid ${accent}30`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${accent}18`,
        overflow: "hidden",
        background: "#0a1428",
      }}>
        {/* Title bar */}
        <div style={{
          height: 56,
          background: `linear-gradient(90deg, ${accent}25 0%, #0f172a 100%)`,
          borderBottom: `1px solid ${accent}30`,
          display: "flex", alignItems: "center",
          padding: "0 24px",
          gap: 16, flexShrink: 0,
        }}>
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 8 }}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 999, background: c }} />
            ))}
          </div>
          {/* Title */}
          <div style={{
            flex: 1, textAlign: "center",
            fontSize: 15, fontWeight: 600, color: "#94a3b8",
            letterSpacing: 0.2,
          }}>
            {title}
          </div>
          {/* Status dot */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#22c55e",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: "#22c55e",
              boxShadow: "0 0 8px #22c55e" }} />
            온라인
          </div>
        </div>

        {/* Subtitle bar */}
        <div style={{
          padding: "10px 24px",
          background: "#0d1b2e",
          borderBottom: `1px solid ${accent}15`,
          fontSize: 14, color: "#64748b",
          flexShrink: 0,
        }}>
          {subtitle}
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1, padding: "24px 24px 16px",
          display: "flex", flexDirection: "column", gap: 16,
          overflowY: "hidden",
        }}>
          {MESSAGES.map((msg, i) => {
            const op = interpolate(frame, [msg.delay, msg.delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const sc = spring({ frame, fps, from: 0.88, to: 1, config: { damping: 16, stiffness: 140 }, delay: msg.delay });
            const slideX = interpolate(frame, [msg.delay, msg.delay + 14],
              [msg.side === "left" ? -30 : 30, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            const isAI = msg.side === "right";
            const bubbleBg = isAI
              ? `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`
              : "linear-gradient(135deg, #1e293b 0%, #162032 100%)";
            const bubbleBorder = isAI ? "none" : `1px solid #334155`;

            return (
              <div key={i} style={{
                display: "flex",
                flexDirection: msg.side === "right" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 12,
                opacity: op,
                transform: `translateX(${slideX}px) scale(${sc})`,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isAI ? `linear-gradient(135deg, ${accent} 0%, #7c3aed 100%)` : "#1e293b",
                  border: isAI ? "none" : "1px solid #334155",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                  boxShadow: isAI ? `0 0 14px ${accent}50` : "none",
                }}>
                  {isAI ? "🤖" : "👤"}
                </div>

                <div style={{
                  maxWidth: "68%",
                  display: "flex", flexDirection: "column",
                  gap: 4,
                  alignItems: msg.side === "right" ? "flex-end" : "flex-start",
                }}>
                  <div style={{ fontSize: 12, color: "#64748b", paddingLeft: 4, paddingRight: 4 }}>
                    {msg.name}
                  </div>
                  <div style={{
                    background: bubbleBg,
                    border: bubbleBorder,
                    borderRadius: msg.side === "right"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    padding: "12px 18px",
                    fontSize: 17, lineHeight: 1.55, color: isAI ? "#fff" : "#e2e8f0",
                    boxShadow: isAI ? `0 4px 20px ${accent}35` : "0 2px 8px rgba(0,0,0,0.3)",
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 12,
            flexDirection: "row",
            opacity: typingOp,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${accent} 0%, #7c3aed 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
              boxShadow: `0 0 14px ${accent}50`,
            }}>
              🤖
            </div>
            <div style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 20px",
              display: "flex", gap: 6, alignItems: "center",
            }}>
              {[0, 1, 2].map(d => {
                const dotOp = 0.3 + (typingDotPhase > d * 6 && typingDotPhase < d * 6 + 12 ? 0.7 : 0);
                return (
                  <div key={d} style={{
                    width: 7, height: 7, borderRadius: 999,
                    background: accent,
                    opacity: dotOp,
                    transition: "opacity 0.15s",
                    boxShadow: `0 0 6px ${accent}`,
                  }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div style={{
          height: 60,
          background: "#0d1b2e",
          borderTop: `1px solid ${accent}20`,
          display: "flex", alignItems: "center",
          padding: "0 20px", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            flex: 1, height: 36, borderRadius: 10,
            background: "#162032", border: "1px solid #334155",
            display: "flex", alignItems: "center",
            padding: "0 14px", fontSize: 14, color: "#475569",
          }}>
            메시지를 입력하세요...
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, cursor: "pointer",
            boxShadow: `0 0 14px ${accent}50`,
          }}>
            ➤
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
