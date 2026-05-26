import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const BUBBLES = [
  { from: "other", text: "안녕하세요! 오늘 어떠세요?" },
  { from: "me",    text: "안녕하세요, 잘 지내고 있어요 😊" },
  { from: "other", text: "새 기능 써봤어요? 정말 놀랍더라고요!" },
  { from: "me",    text: "맞아요, AI 분석이 정확해서 깜짝 놀랐어요" },
  { from: "other", text: "다음엔 같이 써봐요 👍" },
];

export const PhoneChatTemplate: React.FC<Props> = ({
  title = "스마트폰 채팅",
  subtitle = "AI 기반 대화 분석",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = interpolate(frame, [0, 20], [80, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const phoneOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const getBubbleOpacity = (index: number) => {
    const start = 22 + index * 13;
    return interpolate(frame, [start, start + 10], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  };
  const getBubbleY = (index: number) => {
    const start = 22 + index * 13;
    return interpolate(frame, [start, start + 10], [18, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  };

  const titleOpacity = interpolate(frame, [5, 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 30% 60%, ${accent}22 0%, #0a0a0f 65%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Geist, sans-serif",
    }}>
      {/* Diagonal stripe overlay */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(-45deg, ${accent}08 0, ${accent}08 1px, transparent 1px, transparent 28px)`,
      }} />

      {/* Left label */}
      <div style={{
        position: "absolute", left: 100, top: "50%",
        transform: "translateY(-50%)",
        opacity: titleOpacity, zIndex: 10,
      }}>
        <div style={{
          fontSize: 56, fontWeight: 900, color: "#fff",
          letterSpacing: -2, lineHeight: 1.1, marginBottom: 16,
        }}>{title}</div>
        <div style={{
          fontSize: 24, fontWeight: 400, color: "#94a3b8", letterSpacing: -0.3,
        }}>{subtitle}</div>
        <div style={{
          marginTop: 28, width: 48, height: 4, borderRadius: 2, background: accent,
        }} />
      </div>

      {/* Phone frame */}
      <div style={{
        position: "absolute", right: 220,
        opacity: phoneOpacity,
        transform: `translateY(${phoneEnter}px)`,
        zIndex: 5,
      }}>
        {/* Phone shell */}
        <div style={{
          width: 320, height: 620, borderRadius: 44,
          background: "linear-gradient(160deg, #1e1e2e 0%, #0f0f1a 100%)",
          border: "2.5px solid #2a2a3e",
          boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px #ffffff08, inset 0 1px 0 #ffffff15`,
          display: "flex", flexDirection: "column", overflow: "hidden",
          position: "relative",
        }}>
          {/* Notch */}
          <div style={{
            width: 110, height: 28, background: "#0f0f1a",
            borderRadius: "0 0 18px 18px", alignSelf: "center", marginTop: 4,
            zIndex: 10,
          }} />

          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "6px 24px 0",
            fontSize: 11, color: "#64748b", fontWeight: 600,
          }}>
            <span>9:41</span><span>●●●</span>
          </div>

          {/* Chat header */}
          <div style={{
            padding: "10px 20px 10px",
            borderBottom: "1px solid #1e2030",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${accent}, #ec4899)`,
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI 어시스턴트</div>
              <div style={{ fontSize: 10, color: "#22c55e" }}>● 온라인</div>
            </div>
          </div>

          {/* Bubbles */}
          <div style={{
            flex: 1, padding: "14px 14px", display: "flex",
            flexDirection: "column", gap: 10, overflowY: "hidden",
          }}>
            {BUBBLES.map((b, i) => (
              <div key={i} style={{
                opacity: getBubbleOpacity(i),
                transform: `translateY(${getBubbleY(i)}px)`,
                display: "flex",
                justifyContent: b.from === "me" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "78%", padding: "8px 12px",
                  borderRadius: b.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: b.from === "me"
                    ? `linear-gradient(135deg, ${accent}, #7c3aed)`
                    : "#1e2030",
                  color: "#fff", fontSize: 11.5, lineHeight: 1.45,
                  boxShadow: b.from === "me" ? `0 4px 14px ${accent}55` : "0 2px 8px rgba(0,0,0,0.4)",
                }}>
                  {b.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div style={{
            margin: "0 12px 20px", padding: "10px 14px",
            background: "#1e2030", borderRadius: 24,
            display: "flex", alignItems: "center", gap: 8,
            border: "1px solid #2a2a3e",
          }}>
            <div style={{ flex: 1, fontSize: 11, color: "#475569" }}>메시지 입력...</div>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}>↑</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
