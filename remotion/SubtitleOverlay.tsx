import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  narration?: string;
  accent?: string;
};

export const SubtitleOverlay: React.FC<Props> = ({ narration, accent }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!narration || narration.trim() === "") {
    return null;
  }

  const accentTint = accent ? `${accent}40` : "rgba(255,255,255,0.25)";

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "8%",
        transform: "translateX(-50%)",
        maxWidth: "80%",
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 12,
        paddingBottom: 12,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: 12,
        border: `1px solid ${accentTint}`,
        color: "#ffffff",
        fontFamily: "Geist, sans-serif",
        fontWeight: 600,
        fontSize: 36,
        lineHeight: 1.3,
        textAlign: "center",
        opacity,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {narration}
    </div>
  );
};
