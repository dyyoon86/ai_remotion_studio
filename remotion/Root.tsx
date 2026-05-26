import { Composition } from "remotion";
import { ComparisonTemplate } from "./ComparisonTemplate";
import { IntroTemplate } from "./IntroTemplate";
import { TextHighlightTemplate } from "./TextHighlightTemplate";
import { ImageCardTemplate } from "./ImageCardTemplate";

// 1920x1080, 30fps, 90 frames (3s)
const DEFAULT_PROPS = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 90,
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="comparison"
      component={ComparisonTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "비교 분석",
        subtitle: "어느 쪽이 우승할까?",
        accent: "#8b5cf6",
        productA: "Product A",
        productB: "Product B",
      }}
    />
    <Composition
      id="intro"
      component={IntroTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "오늘의 영상",
        subtitle: "AI가 자동 분석한 결과",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="highlight"
      component={TextHighlightTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이 부분이 핵심입니다",
        subtitle: "포인트 강조",
        accent: "#fbbf24",
      }}
    />
    <Composition
      id="imagecard"
      component={ImageCardTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이미지 카드",
        subtitle: "설명",
        accent: "#10b981",
      }}
    />
  </>
);
