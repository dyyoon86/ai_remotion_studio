import type { TemplateId } from "./store";

/**
 * Template catalog — source of truth for LLM template recommendations.
 *
 * Each entry describes ONE of the 36 Remotion templates:
 *  - `vibe`     : short visual/mood phrase (English, evocative)
 *  - `bestFor`  : Korean sentence describing the scene type this template fits
 *
 * Keep entries DISTINCT — the LLM needs varied signals to pick well.
 */
export type TemplateCatalogEntry = {
  id: TemplateId;
  label: string;
  vibe: string;
  bestFor: string;
};

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: "intro",
    label: "인트로",
    vibe: "warm opening pulse, soft glow title reveal",
    bestFor: "영상 시작부, 후킹용 오프닝, 채널/주제 첫 인사",
  },
  {
    id: "comparison",
    label: "비교분석",
    vibe: "two-column side-by-side analysis with contrast",
    bestFor: "두 제품/옵션 비교, A vs B 구조, 장단점 대조",
  },
  {
    id: "comparisonV2",
    label: "비교분석 V2",
    vibe: "modernized split-screen comparison, sharper typography",
    bestFor: "비교 구조이지만 더 세련된 시각이 필요할 때, 2개 항목 비교 리뉴얼본",
  },
  {
    id: "highlight",
    label: "텍스트강조",
    vibe: "single bold word emphasized with accent stroke",
    bestFor: "핵심 키워드/문장 강조, 짧은 임팩트 카피",
  },
  {
    id: "imagecard",
    label: "이미지카드",
    vibe: "image-led card with caption block",
    bestFor: "제품/장면 이미지를 큼직하게 보여주며 간단한 설명을 곁들일 때",
  },
  {
    id: "flowSteps",
    label: "단계별 흐름도",
    vibe: "left-to-right step arrows, numbered progression",
    bestFor: "여러 단계로 이루어진 절차/프로세스, 1→2→3 흐름 설명",
  },
  {
    id: "keywordImpact",
    label: "키워드 임팩트",
    vibe: "explosive keyword pop with shock zoom",
    bestFor: "충격적 사실/숫자/키워드를 강하게 박을 때, 시청자 각성 포인트",
  },
  {
    id: "gridCard",
    label: "그리드 카드",
    vibe: "3-4 grid tiles arranged neatly, equal weight",
    bestFor: "3~4개 항목을 동등하게 나열할 때, 기능/특징 카탈로그",
  },
  {
    id: "numberList",
    label: "번호리스트",
    vibe: "vertical numbered list, clean editorial",
    bestFor: "Top N 리스트, 1위~5위 랭킹, 순서 있는 항목 나열",
  },
  {
    id: "layerStack",
    label: "레이어 스택",
    vibe: "stacked depth layers sliding into view",
    bestFor: "계층 구조, 적층된 개념(레이어, 모듈, 단계) 설명",
  },
  {
    id: "bidirectional",
    label: "양방향 연결",
    vibe: "two nodes connected by animated flow lines",
    bestFor: "두 대상 사이의 상호작용/관계 시각화, 송수신/거래 관계",
  },
  {
    id: "chatInterface",
    label: "대화 인터페이스",
    vibe: "messenger bubbles in dark chat UI",
    bestFor: "대화/메신저 형식의 스토리, Q&A, 대화체 콘텐츠",
  },
  {
    id: "phoneChat",
    label: "스마트폰 채팅",
    vibe: "phone mockup with realistic SMS thread",
    bestFor: "스마트폰 화면 안 채팅 연출, 실제 카톡/문자 느낌이 필요한 씬",
  },
  {
    id: "gaugeMeter",
    label: "게이지 측정",
    vibe: "circular gauge with animated needle sweep",
    bestFor: "수치/지표/퍼센트 시각화, 만족도·점수·게이지 표현",
  },
  {
    id: "treeExplorer",
    label: "트리 탐색",
    vibe: "expanding hierarchical tree, branch reveals",
    bestFor: "분기형 분류/카테고리 트리, 의사결정 흐름, 계통도",
  },
  {
    id: "multiPanelDash",
    label: "다중 패널 대시보드",
    vibe: "data dashboard with multiple synced panels",
    bestFor: "여러 지표를 한 화면에 모아 보여줄 때, 분석 결과 종합",
  },
  {
    id: "premiumIntro",
    label: "프리미엄 인트로",
    vibe: "high-end glow, slow zoom, cinematic luxe",
    bestFor: "브랜드/프리미엄 영상 첫 컷, 고급스러운 오프닝",
  },
  {
    id: "floatingCard3D",
    label: "3D 플로팅 카드",
    vibe: "3D card floating in space with parallax tilt",
    bestFor: "단일 카드/제품을 3D로 띄워 강조, 신제품 단독 소개",
  },
  {
    id: "premiumMetric",
    label: "프리미엄 메트릭",
    vibe: "elegant big-number reveal with gold accents",
    bestFor: "큰 숫자/수익/성과 지표 강조, 프리미엄 톤의 성과 자랑",
  },
  {
    id: "gridExplosion",
    label: "그리드 익스플로전",
    vibe: "grid tiles bursting outward dynamically",
    bestFor: "여러 항목을 다이내믹하게 등장시키며 임팩트 줄 때, 사례 폭발 나열",
  },
  {
    id: "kineticTypo",
    label: "키네틱 타이포",
    vibe: "high-energy kinetic typography word burst",
    bestFor: "강한 메시지 한 줄, 캐치프레이즈, 텍스트 자체가 주인공인 씬",
  },
  {
    id: "kineticCompact",
    label: "키네틱 콤팩트",
    vibe: "compact rhythmic word swap, tight beat",
    bestFor: "짧고 빠른 단어 교체 연출, 리듬감 있는 키워드 나열",
  },
  {
    id: "redditStory",
    label: "레딧 스토리 모드",
    vibe: "reddit-style story card with TTS-driven reveal",
    bestFor: "썰/사연/스토리텔링형 영상, 익명 후기·경험담 소개",
  },
  {
    id: "imageEmphasis",
    label: "이미지 강조",
    vibe: "image pushed forward with vignette focus",
    bestFor: "한 장의 이미지를 시각적으로 강조, 사진이 메인인 컷",
  },
  {
    id: "imageEmphasisV2",
    label: "이미지강조 V2",
    vibe: "image emphasis with layered overlay annotations",
    bestFor: "이미지에 주석/라벨을 덧붙여 부분을 짚어주는 씬",
  },
  {
    id: "logoBrand",
    label: "로고(브랜드)강조",
    vibe: "single logo bloom, brand lockup reveal",
    bestFor: "브랜드/로고 단독 등장, 협찬·소속 표시, 클로징 브랜드 컷",
  },
  {
    id: "logoDualSnap",
    label: "로고 듀얼 스냅",
    vibe: "two logos snap together with collision energy",
    bestFor: "두 브랜드 협업/콜라보 발표, 인수합병, 짝 로고 강조",
  },
  {
    id: "logoClone",
    label: "로고분신술",
    vibe: "logo multiplies into many duplicates, swarm",
    bestFor: "브랜드 확산/대량 전개를 표현, 다수 매장·팬덤 강조",
  },
  {
    id: "logoMetrics",
    label: "로고 강조 메트릭스",
    vibe: "logo center-stage surrounded by orbiting KPIs",
    bestFor: "브랜드 + 핵심 지표를 함께 보여줄 때, 회사 소개 + 성과",
  },
  {
    id: "premiumFunnel",
    label: "프리미엄 퍼널",
    vibe: "funnel pipeline narrowing top to bottom",
    bestFor: "퍼널/전환 단계 설명, 노출→관심→구매 흐름 시각화",
  },
  {
    id: "strategicBlueprint",
    label: "전략적 블루프린트",
    vibe: "architectural blueprint with technical schematic",
    bestFor: "전략/플랜/설계도 느낌의 구조 설명, 종합 로드맵",
  },
  {
    id: "orbitTimeline",
    label: "궤도 타임라인",
    vibe: "orbital ring timeline with planet-like nodes",
    bestFor: "연대기/타임라인 사건 나열, 회전형 히스토리 시각화",
  },
  {
    id: "logicFlow",
    label: "논리 흐름도",
    vibe: "boxes-and-arrows logic diagram, decision flow",
    bestFor: "논리적 인과관계/조건 분기 설명, if-then 흐름",
  },
  {
    id: "hologramCore",
    label: "홀로그램 코어",
    vibe: "holographic core sphere, sci-fi tech aura",
    bestFor: "기술/AI/미래지향 키비주얼, 첨단 시스템 컨셉 컷",
  },
  {
    id: "cinematicMatrix",
    label: "시네마틱 매트릭스",
    vibe: "cinematic matrix grid sweep, neo-noir grade",
    bestFor: "복수의 사례/데이터를 영화적으로 깔아줄 때, 임팩트 큰 전환",
  },
  {
    id: "quantumSingularity",
    label: "퀀텀 싱귤래리티",
    vibe: "singularity vortex pulling particles inward",
    bestFor: "결정적 순간/모든 것이 수렴하는 핵심 결론, 강력한 클라이맥스 컷",
  },
];
