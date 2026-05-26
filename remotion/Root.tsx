import { Composition } from "remotion";
import { ComparisonTemplate } from "./ComparisonTemplate";
import { IntroTemplate } from "./IntroTemplate";
import { TextHighlightTemplate } from "./TextHighlightTemplate";
import { ImageCardTemplate } from "./ImageCardTemplate";
import { FlowStepsTemplate } from "./FlowStepsTemplate";
import { KeywordImpactTemplate } from "./KeywordImpactTemplate";
import { GridCardTemplate } from "./GridCardTemplate";
import { NumberListTemplate } from "./NumberListTemplate";
import { LayerStackTemplate } from "./LayerStackTemplate";
import { BidirectionalTemplate } from "./BidirectionalTemplate";
import { ChatInterfaceTemplate } from "./ChatInterfaceTemplate";
import { PhoneChatTemplate } from "./PhoneChatTemplate";
import { GaugeMeterTemplate } from "./GaugeMeterTemplate";
import { TreeExplorerTemplate } from "./TreeExplorerTemplate";
import { MultiPanelDashTemplate } from "./MultiPanelDashTemplate";
import { PremiumIntroTemplate } from "./PremiumIntroTemplate";
import { FloatingCard3DTemplate } from "./FloatingCard3DTemplate";
import { PremiumMetricTemplate } from "./PremiumMetricTemplate";
import { GridExplosionTemplate } from "./GridExplosionTemplate";
import { KineticTypoTemplate } from "./KineticTypoTemplate";
import { RedditStoryTemplate } from "./RedditStoryTemplate";
import { ImageEmphasisTemplate } from "./ImageEmphasisTemplate";
import { ImageEmphasisV2Template } from "./ImageEmphasisV2Template";
import { LogoBrandTemplate } from "./LogoBrandTemplate";
import { PremiumFunnelTemplate } from "./PremiumFunnelTemplate";
import { StrategicBlueprintTemplate } from "./StrategicBlueprintTemplate";
import { OrbitTimelineTemplate } from "./OrbitTimelineTemplate";
import { LogicFlowTemplate } from "./LogicFlowTemplate";
import { HologramCoreTemplate } from "./HologramCoreTemplate";
import { CinematicMatrixTemplate } from "./CinematicMatrixTemplate";
import { QuantumSingularityTemplate } from "./QuantumSingularityTemplate";
import { LogoDualSnapTemplate } from "./LogoDualSnapTemplate";
import { LogoCloneTemplate } from "./LogoCloneTemplate";
import { LogoMetricsTemplate } from "./LogoMetricsTemplate";
import { KineticCompactTemplate } from "./KineticCompactTemplate";
import { ComparisonV2Template } from "./ComparisonV2Template";

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
    <Composition
      id="flowSteps"
      component={FlowStepsTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "단계별 흐름도",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="keywordImpact"
      component={KeywordImpactTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "키워드 임팩트",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="gridCard"
      component={GridCardTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "그리드 카드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="numberList"
      component={NumberListTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "번호리스트",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="layerStack"
      component={LayerStackTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "레이어 스택",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="bidirectional"
      component={BidirectionalTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "양방향 연결",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="chatInterface"
      component={ChatInterfaceTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "대화 인터페이스",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="phoneChat"
      component={PhoneChatTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "스마트폰 채팅",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="gaugeMeter"
      component={GaugeMeterTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "게이지 측정",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="treeExplorer"
      component={TreeExplorerTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "트리 탐색",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="multiPanelDash"
      component={MultiPanelDashTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "다중 패널 대시보드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="premiumIntro"
      component={PremiumIntroTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "프리미엄 인트로",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="floatingCard3D"
      component={FloatingCard3DTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "3D 플로팅 카드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="premiumMetric"
      component={PremiumMetricTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "프리미엄 메트릭",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="gridExplosion"
      component={GridExplosionTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "그리드 익스플로전",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="kineticTypo"
      component={KineticTypoTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "키네틱 타이포",
        subtitle: "샘플 설명",
        accent: "#22d3ee",
      }}
    />
    <Composition
      id="redditStory"
      component={RedditStoryTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "레딧 스토리 모드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="imageEmphasis"
      component={ImageEmphasisTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이미지 강조",
        subtitle: "샘플 설명",
        accent: "#10b981",
      }}
    />
    <Composition
      id="imageEmphasisV2"
      component={ImageEmphasisV2Template}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이미지강조 V2",
        subtitle: "샘플 설명",
        accent: "#10b981",
      }}
    />
    <Composition
      id="logoBrand"
      component={LogoBrandTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고(브랜드)강조",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
      }}
    />
    <Composition
      id="premiumFunnel"
      component={PremiumFunnelTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "프리미엄 퍼널",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="strategicBlueprint"
      component={StrategicBlueprintTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "전략적 블루프린트",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="orbitTimeline"
      component={OrbitTimelineTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "궤도 타임라인",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="logicFlow"
      component={LogicFlowTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "논리 흐름도",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="hologramCore"
      component={HologramCoreTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "홀로그램 코어",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="cinematicMatrix"
      component={CinematicMatrixTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "시네마틱 매트릭스",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="quantumSingularity"
      component={QuantumSingularityTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "퀀텀 싱귤래리티",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
      }}
    />
    <Composition
      id="logoDualSnap"
      component={LogoDualSnapTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고 듀얼 스냅",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
        productA: "Brand A",
        productB: "Brand B",
      }}
    />
    <Composition
      id="logoClone"
      component={LogoCloneTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고분신술",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
      }}
    />
    <Composition
      id="logoMetrics"
      component={LogoMetricsTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고 강조 메트릭스",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
      }}
    />
    <Composition
      id="kineticCompact"
      component={KineticCompactTemplate}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "키네틱 콤팩트",
        subtitle: "샘플 설명",
        accent: "#22d3ee",
      }}
    />
    <Composition
      id="comparisonV2"
      component={ComparisonV2Template}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "비교분석 V2",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        productA: "Option A",
        productB: "Option B",
      }}
    />
  </>
);
