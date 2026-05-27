import { Composition } from "remotion";
import { TEMPLATE_COMPONENT } from "./registry";

// 1920x1080, 30fps, 90 frames (3s)
const DEFAULT_PROPS = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 90,
};

const DEFAULT_NARRATION = "여기에 나레이션 자막이 표시됩니다";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="comparison"
      component={TEMPLATE_COMPONENT.comparison}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "비교 분석",
        subtitle: "어느 쪽이 우승할까?",
        accent: "#8b5cf6",
        productA: "Product A",
        productB: "Product B",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="intro"
      component={TEMPLATE_COMPONENT.intro}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "오늘의 영상",
        subtitle: "AI가 자동 분석한 결과",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="highlight"
      component={TEMPLATE_COMPONENT.highlight}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이 부분이 핵심입니다",
        subtitle: "포인트 강조",
        accent: "#fbbf24",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="imagecard"
      component={TEMPLATE_COMPONENT.imagecard}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이미지 카드",
        subtitle: "설명",
        accent: "#10b981",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="flowSteps"
      component={TEMPLATE_COMPONENT.flowSteps}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "단계별 흐름도",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="keywordImpact"
      component={TEMPLATE_COMPONENT.keywordImpact}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "키워드 임팩트",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="gridCard"
      component={TEMPLATE_COMPONENT.gridCard}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "그리드 카드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="numberList"
      component={TEMPLATE_COMPONENT.numberList}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "번호리스트",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="layerStack"
      component={TEMPLATE_COMPONENT.layerStack}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "레이어 스택",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="bidirectional"
      component={TEMPLATE_COMPONENT.bidirectional}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "양방향 연결",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="chatInterface"
      component={TEMPLATE_COMPONENT.chatInterface}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "대화 인터페이스",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="phoneChat"
      component={TEMPLATE_COMPONENT.phoneChat}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "스마트폰 채팅",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="gaugeMeter"
      component={TEMPLATE_COMPONENT.gaugeMeter}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "게이지 측정",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="treeExplorer"
      component={TEMPLATE_COMPONENT.treeExplorer}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "트리 탐색",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="multiPanelDash"
      component={TEMPLATE_COMPONENT.multiPanelDash}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "다중 패널 대시보드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="premiumIntro"
      component={TEMPLATE_COMPONENT.premiumIntro}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "프리미엄 인트로",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="floatingCard3D"
      component={TEMPLATE_COMPONENT.floatingCard3D}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "3D 플로팅 카드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="premiumMetric"
      component={TEMPLATE_COMPONENT.premiumMetric}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "프리미엄 메트릭",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="gridExplosion"
      component={TEMPLATE_COMPONENT.gridExplosion}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "그리드 익스플로전",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="kineticTypo"
      component={TEMPLATE_COMPONENT.kineticTypo}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "키네틱 타이포",
        subtitle: "샘플 설명",
        accent: "#22d3ee",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="redditStory"
      component={TEMPLATE_COMPONENT.redditStory}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "레딧 스토리 모드",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="imageEmphasis"
      component={TEMPLATE_COMPONENT.imageEmphasis}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이미지 강조",
        subtitle: "샘플 설명",
        accent: "#10b981",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="imageEmphasisV2"
      component={TEMPLATE_COMPONENT.imageEmphasisV2}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "이미지강조 V2",
        subtitle: "샘플 설명",
        accent: "#10b981",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="logoBrand"
      component={TEMPLATE_COMPONENT.logoBrand}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고(브랜드)강조",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="premiumFunnel"
      component={TEMPLATE_COMPONENT.premiumFunnel}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "프리미엄 퍼널",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="strategicBlueprint"
      component={TEMPLATE_COMPONENT.strategicBlueprint}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "전략적 블루프린트",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="orbitTimeline"
      component={TEMPLATE_COMPONENT.orbitTimeline}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "궤도 타임라인",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="logicFlow"
      component={TEMPLATE_COMPONENT.logicFlow}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "논리 흐름도",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="hologramCore"
      component={TEMPLATE_COMPONENT.hologramCore}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "홀로그램 코어",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="cinematicMatrix"
      component={TEMPLATE_COMPONENT.cinematicMatrix}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "시네마틱 매트릭스",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="quantumSingularity"
      component={TEMPLATE_COMPONENT.quantumSingularity}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "퀀텀 싱귤래리티",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="logoDualSnap"
      component={TEMPLATE_COMPONENT.logoDualSnap}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고 듀얼 스냅",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
        productA: "Brand A",
        productB: "Brand B",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="logoClone"
      component={TEMPLATE_COMPONENT.logoClone}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고분신술",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="logoMetrics"
      component={TEMPLATE_COMPONENT.logoMetrics}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "로고 강조 메트릭스",
        subtitle: "샘플 설명",
        accent: "#f59e0b",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="kineticCompact"
      component={TEMPLATE_COMPONENT.kineticCompact}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "키네틱 콤팩트",
        subtitle: "샘플 설명",
        accent: "#22d3ee",
        narration: DEFAULT_NARRATION,
      }}
    />
    <Composition
      id="comparisonV2"
      component={TEMPLATE_COMPONENT.comparisonV2}
      {...DEFAULT_PROPS}
      defaultProps={{
        title: "비교분석 V2",
        subtitle: "샘플 설명",
        accent: "#8b5cf6",
        productA: "Option A",
        productB: "Option B",
        narration: DEFAULT_NARRATION,
      }}
    />
  </>
);
