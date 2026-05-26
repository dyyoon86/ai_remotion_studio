import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

const BAR_DATA = [65, 82, 54, 91, 73, 88, 60];
const BAR_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const LINE_DATA = [30, 45, 38, 60, 52, 71, 65, 80, 74, 90];
const STATUS_ITEMS = [
  { label: "API 서버", status: "정상", ok: true },
  { label: "데이터베이스", status: "정상", ok: true },
  { label: "캐시 레이어", status: "주의", ok: false },
  { label: "CDN", status: "정상", ok: true },
];

export const MultiPanelDashTemplate: React.FC<Props> = ({
  title = "다중 패널 대시보드",
  subtitle = "실시간 시스템 현황",
  accent = "#8b5cf6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 14], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [delay, delay + 14], [30, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })}px)`,
  });

  const headerOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // KPI counter
  const kpiProgress = spring({ frame, fps, from: 0, to: 1, config: { damping: 20, stiffness: 80 } });
  const kpiValue = Math.round(kpiProgress * 94283);

  // Bar heights animated
  const barProgress = interpolate(frame, [30, 65], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Line sparkline progress
  const lineProgress = interpolate(frame, [42, 78], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const visiblePoints = Math.max(2, Math.round(lineProgress * LINE_DATA.length));

  const panel = (content: React.ReactNode, delay: number, style?: React.CSSProperties) => (
    <div style={{
      ...panelIn(delay),
      background: "#0d0d1e",
      border: "1px solid #1e2030",
      borderRadius: 16,
      padding: "20px 24px",
      ...style,
    }}>
      {content}
    </div>
  );

  const panelLabel = (txt: string) => (
    <div style={{
      fontSize: 12, fontWeight: 700, color: "#475569",
      letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
    }}>{txt}</div>
  );

  // SVG sparkline path
  const W = 320, H = 80;
  const pts = LINE_DATA.slice(0, visiblePoints).map((v, i) => ({
    x: (i / (LINE_DATA.length - 1)) * W,
    y: H - (v / 100) * H,
  }));
  const sparkPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(160deg, #060612 0%, #0a0a18 100%)",
      fontFamily: "Geist, sans-serif", color: "#fff",
      padding: "56px 72px",
    }}>
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(${accent}10 1px, transparent 1px)`,
        backgroundSize: "36px 36px",
      }} />

      {/* Header */}
      <div style={{ opacity: headerOpacity, marginBottom: 36, zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
          <div style={{ width: 8, height: 40, borderRadius: 4, background: accent }} />
          <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>{title}</div>
        </div>
        <div style={{ fontSize: 18, color: "#64748b", paddingLeft: 24 }}>{subtitle}</div>
      </div>

      {/* 2×2 grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr", gap: 24, flex: 1, zIndex: 2,
      }}>
        {/* Panel 1: KPI */}
        {panel(
          <>
            {panelLabel("총 사용자")}
            <div style={{
              fontSize: 72, fontWeight: 900, letterSpacing: -3,
              background: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}>
              {kpiValue.toLocaleString()}
            </div>
            <div style={{ fontSize: 15, color: "#22c55e", marginTop: 10, fontWeight: 600 }}>
              ▲ 12.4% 이번 달
            </div>
          </>,
          18
        )}

        {/* Panel 2: Bar chart */}
        {panel(
          <>
            {panelLabel("일별 활성 사용자")}
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10,
              height: 120, paddingTop: 8,
            }}>
              {BAR_DATA.map((v, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: "100%",
                    height: (v / 100) * 100 * barProgress,
                    borderRadius: "4px 4px 0 0",
                    background: `linear-gradient(180deg, ${accent}, ${accent}66)`,
                    boxShadow: `0 0 12px ${accent}44`,
                  }} />
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{BAR_LABELS[i]}</div>
                </div>
              ))}
            </div>
          </>,
          28
        )}

        {/* Panel 3: Sparkline */}
        {panel(
          <>
            {panelLabel("전환율 추이")}
            <svg width="100%" height={80} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              {pts.length > 1 && (
                <>
                  <path
                    d={`${sparkPath} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`}
                    fill="url(#lineGrad)"
                  />
                  <path d={sparkPath} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
                  <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={accent} />
                </>
              )}
            </svg>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
              {Math.round(LINE_DATA[visiblePoints - 1] ?? 0)}%
              <span style={{ fontSize: 14, color: "#22c55e", marginLeft: 8 }}>▲ 상승중</span>
            </div>
          </>,
          38
        )}

        {/* Panel 4: Status list */}
        {panel(
          <>
            {panelLabel("서비스 상태")}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STATUS_ITEMS.map((item, i) => {
                const itemOpacity = interpolate(frame, [50 + i * 8, 60 + i * 8], [0, 1], {
                  extrapolateLeft: "clamp", extrapolateRight: "clamp",
                });
                return (
                  <div key={i} style={{
                    opacity: itemOpacity,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: 8,
                    background: "#0a0a14",
                  }}>
                    <span style={{ fontSize: 14, color: "#cbd5e1" }}>{item.label}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: item.ok ? "#22c55e" : "#f59e0b",
                      padding: "3px 10px", borderRadius: 12,
                      background: item.ok ? "#22c55e18" : "#f59e0b18",
                    }}>
                      {item.ok ? "● " : "◐ "}{item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </>,
          48
        )}
      </div>
    </AbsoluteFill>
  );
};
