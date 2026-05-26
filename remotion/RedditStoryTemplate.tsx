import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  image?: string;
  productA?: string;
  productB?: string;
};

export const RedditStoryTemplate: React.FC<Props> = ({
  title = "오늘 퇴근 후 길에서 10만원을 주웠는데 신고해야 할까요?",
  subtitle = "경찰서에 신고하러 갔더니 담당 경찰관이 오히려 제게 이상한 말을 했습니다. 믿을 수가 없어서...",
  accent = "#ff4500",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, from: 0.88, to: 1, config: { damping: 14, stiffness: 100 } });
  const cardOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const headerOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [18, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [18, 36], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bodyOpacity = interpolate(frame, [36, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrollY = interpolate(frame, [40, 88], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const upvoteScale = spring({ frame: Math.max(0, frame - 30), fps, from: 0.5, to: 1, config: { damping: 10, stiffness: 200 } });
  const upvoteGlow = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const awards = ["🏆", "💎", "❤️"];

  return (
    <AbsoluteFill style={{
      background: "#0d1117",
      fontFamily: "Geist, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Subtle Reddit-orange vignette */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%, ${accent}0a 0%, transparent 70%)`,
      }} />

      {/* Card */}
      <div style={{
        width: 860,
        opacity: cardOpacity,
        transform: `scale(${cardScale}) translateY(${scrollY}px)`,
        background: "#1a1a1b",
        border: "1px solid #343536",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        zIndex: 2,
      }}>
        {/* Vote sidebar + content layout */}
        <div style={{ display: "flex" }}>
          {/* Vote column */}
          <div style={{
            width: 48,
            background: "#161617",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 20,
            gap: 6,
            flexShrink: 0,
          }}>
            <div style={{
              transform: `scale(${upvoteScale})`,
              filter: `drop-shadow(0 0 8px ${accent}${Math.round(upvoteGlow * 255).toString(16).padStart(2, "0")})`,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={accent}>
                <path d="M12 4l8 8H4z" />
              </svg>
            </div>
            <span style={{ color: accent, fontSize: 14, fontWeight: 700 }}>2.4k</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#818384">
              <path d="M12 20l8-8H4z" />
            </svg>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: "16px 20px" }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              opacity: headerOpacity, marginBottom: 10,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 999,
                background: `linear-gradient(135deg, ${accent}, #ff7849)`,
              }} />
              <span style={{ color: "#818384", fontSize: 13 }}>
                <span style={{ color: "#d7dadc", fontWeight: 600 }}>r/Korea</span>
                {" "}• Posted by{" "}
                <span style={{ color: "#818384" }}>u/anonymous_user</span>
              </span>
              <span style={{ color: "#818384", fontSize: 12, marginLeft: "auto" }}>6시간 전</span>
            </div>

            {/* Post title */}
            <div style={{
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              fontSize: 22,
              fontWeight: 700,
              color: "#d7dadc",
              lineHeight: 1.4,
              marginBottom: 12,
            }}>
              {title}
            </div>

            {/* Awards row */}
            <div style={{
              display: "flex", gap: 6, marginBottom: 12,
              opacity: bodyOpacity,
            }}>
              {awards.map((a, i) => (
                <span key={i} style={{
                  background: "#272729",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 12,
                  color: "#d7dadc",
                }}>{a} Award</span>
              ))}
            </div>

            {/* Body text */}
            <div style={{
              opacity: bodyOpacity,
              fontSize: 16,
              color: "#9c9c9d",
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              {subtitle}
            </div>

            {/* Action bar */}
            <div style={{
              display: "flex", gap: 20,
              opacity: bodyOpacity,
              borderTop: "1px solid #343536",
              paddingTop: 12,
            }}>
              {["💬 487 댓글", "🔗 공유", "🔖 저장", "• • •"].map((action, i) => (
                <span key={i} style={{
                  color: "#818384", fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                }}>
                  {action}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subreddit badge top */}
      <div style={{
        position: "absolute",
        top: 60,
        opacity: headerOpacity,
        display: "flex", alignItems: "center", gap: 10,
        zIndex: 3,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: `linear-gradient(135deg, ${accent}, #ff7849)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>r</div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>r/Korea</span>
        <span style={{
          background: accent,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          borderRadius: 4,
          padding: "2px 8px",
        }}>STORY</span>
      </div>
    </AbsoluteFill>
  );
};
