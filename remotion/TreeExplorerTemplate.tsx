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

type TreeNode = {
  name: string;
  icon: string;
  revealFrame: number;
  level: number;
  children?: TreeNode[];
  detail?: string;
};

const TREE: TreeNode[] = [
  { name: "프로젝트 루트", icon: "📁", revealFrame: 10, level: 0, detail: "AI 분석 프로젝트 — 12개 모듈", children: [
    { name: "src", icon: "📂", revealFrame: 20, level: 1, detail: "소스 코드 디렉토리 — 48개 파일", children: [
      { name: "components", icon: "🧩", revealFrame: 30, level: 2, detail: "재사용 컴포넌트 — 16개 파일" },
      { name: "utils", icon: "🔧", revealFrame: 38, level: 2, detail: "유틸리티 함수 — 8개 파일" },
      { name: "styles", icon: "🎨", revealFrame: 46, level: 2, detail: "CSS 모듈 — 12개 파일" },
    ]},
    { name: "public", icon: "🌐", revealFrame: 55, level: 1, detail: "정적 파일 — 24개 에셋", children: [
      { name: "images", icon: "🖼", revealFrame: 63, level: 2, detail: "최적화된 이미지 — 18개" },
      { name: "fonts", icon: "🔤", revealFrame: 70, level: 2, detail: "웹폰트 — 4개" },
    ]},
    { name: "docs", icon: "📄", revealFrame: 78, level: 1, detail: "문서 — 6개 마크다운 파일" },
  ]},
];

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  function walk(ns: TreeNode[]) {
    for (const n of ns) {
      result.push(n);
      if (n.children) walk(n.children);
    }
  }
  walk(nodes);
  return result;
}

const FLAT = flattenTree(TREE);

export const TreeExplorerTemplate: React.FC<Props> = ({
  title = "트리 탐색",
  subtitle = "파일 구조 분석",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();

  // Which node is "selected" — the last visible one
  const visibleNodes = FLAT.filter(n => frame >= n.revealFrame);
  const selected = visibleNodes[visibleNodes.length - 1] ?? FLAT[0];

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panelEnter = interpolate(frame, [5, 25], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #070712 0%, #0d0d1e 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "Geist, sans-serif", color: "#fff",
      padding: "60px 80px",
    }}>
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(0deg, ${accent}06 0, ${accent}06 1px, transparent 1px, transparent 44px)`,
      }} />

      {/* Header */}
      <div style={{ opacity: headerOpacity, marginBottom: 40, zIndex: 2 }}>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 20, color: "#64748b", marginTop: 6 }}>{subtitle}</div>
      </div>

      {/* Two-panel layout */}
      <div style={{
        display: "flex", gap: 32, flex: 1, zIndex: 2,
        transform: `translateY(${panelEnter}px)`,
        opacity: interpolate(frame, [5, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        {/* Left: tree */}
        <div style={{
          width: 480, background: "#0d0d1e",
          border: "1px solid #1e2030", borderRadius: 16,
          padding: "24px 20px", overflow: "hidden",
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#475569",
            letterSpacing: 2, marginBottom: 16, textTransform: "uppercase",
          }}>파일 탐색기</div>

          {FLAT.map((node, i) => {
            const opacity = interpolate(frame, [node.revealFrame, node.revealFrame + 8], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const slideX = interpolate(frame, [node.revealFrame, node.revealFrame + 8], [-20, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const isSelected = selected === node;

            return (
              <div key={i} style={{
                opacity,
                transform: `translateX(${slideX}px)`,
                display: "flex", alignItems: "center",
                padding: "7px 10px",
                paddingLeft: 10 + node.level * 22,
                borderRadius: 8, marginBottom: 2,
                background: isSelected ? `${accent}28` : "transparent",
                borderLeft: isSelected ? `3px solid ${accent}` : "3px solid transparent",
                transition: "background 0.2s",
              }}>
                <span style={{ fontSize: 16, marginRight: 8 }}>{node.icon}</span>
                <span style={{
                  fontSize: 14, fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? "#fff" : "#94a3b8",
                }}>{node.name}</span>
                {node.children && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#334155" }}>
                    {node.children.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: detail panel */}
        <div style={{
          flex: 1, background: "#0d0d1e",
          border: "1px solid #1e2030", borderRadius: 16,
          padding: "28px 32px", display: "flex", flexDirection: "column",
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#475569",
            letterSpacing: 2, marginBottom: 24, textTransform: "uppercase",
          }}>상세 정보</div>

          <div style={{
            fontSize: 56, marginBottom: 16, lineHeight: 1,
          }}>{selected.icon}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 10 }}>
            {selected.name}
          </div>
          <div style={{ fontSize: 18, color: "#64748b", marginBottom: 32 }}>
            {selected.detail ?? "—"}
          </div>

          <div style={{
            height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`,
            borderRadius: 1, marginBottom: 24,
          }} />

          <div style={{ display: "flex", gap: 16 }}>
            {["수정됨: 오늘", `깊이: ${selected.level}단계`, "상태: 정상"].map((tag, i) => (
              <div key={i} style={{
                padding: "6px 14px", borderRadius: 20,
                background: i === 0 ? `${accent}28` : "#1e2030",
                color: i === 0 ? accent : "#64748b",
                fontSize: 13, fontWeight: 600,
              }}>{tag}</div>
            ))}
          </div>

          {/* Mini path breadcrumb */}
          <div style={{
            marginTop: "auto", padding: "14px 16px",
            background: "#070712", borderRadius: 10,
            fontSize: 13, color: "#334155", fontFamily: "monospace",
          }}>
            / {selected.level > 0 ? "프로젝트 루트 / " : ""}{selected.name}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
