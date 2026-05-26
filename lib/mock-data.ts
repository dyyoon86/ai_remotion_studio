import type { Scene, TranscriptLine } from "./store";

const PRESET_NARRATIONS: { title: string; narration: string }[] = [
  {
    title: "오프닝",
    narration:
      "안녕하세요, 오늘은 인기 무선 이어폰 3종을 비교해보겠습니다. 어떤 제품이 당신에게 맞을지 함께 살펴봐요.",
  },
  {
    title: "1번 제품",
    narration:
      "첫 번째 제품은 음질이 뛰어나지만 배터리가 짧습니다. 음악 감상에 집중하는 분께 추천드려요.",
  },
  {
    title: "2번 제품 — 가성비왕",
    narration:
      "두 번째 제품은 가성비가 최고죠. 가격 대비 만족도 1위, 입문용으로도 손색없습니다.",
  },
  {
    title: "3번 제품 — 노캔 끝판왕",
    narration:
      "세 번째는 노이즈 캔슬링이 강력합니다. 출퇴근길 지하철에서 진가를 발휘하죠.",
  },
  {
    title: "정리",
    narration:
      "결론: 본인 사용 패턴에 따라 선택하세요. 음질, 가성비, 노캔 — 우선순위를 정하면 답이 보입니다.",
  },
  {
    title: "엔딩 콜투액션",
    narration:
      "더 자세한 정보는 영상 설명란을 확인해주세요. 좋아요와 구독은 큰 힘이 됩니다.",
  },
];

const DEFAULT_TEMPLATES = [
  "intro",
  "comparison",
  "comparison",
  "highlight",
  "imagecard",
  "highlight",
] as const;

const ACCENT_ROTATION = [
  "#8b5cf6",
  "#22d3ee",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
];

export const INITIAL_SCENES: Scene[] = PRESET_NARRATIONS.map((p, i) => ({
  id: `scene-${i + 1}`,
  index: i + 1,
  title: p.title,
  narration: p.narration,
  template: DEFAULT_TEMPLATES[i] ?? "intro",
  titleMeta: p.title,
  subtitleMeta:
    i === 0
      ? "2025년 무선이어폰 추천"
      : i === PRESET_NARRATIONS.length - 1
      ? "구독 · 좋아요 · 알림설정"
      : "쇼핑 인사이트",
  accentColor: ACCENT_ROTATION[i % ACCENT_ROTATION.length],
  image: undefined,
}));

export const INITIAL_TRANSCRIPT: TranscriptLine[] = [
  { id: "t1", timestamp: "00:00", text: "안녕하세요, 오늘은 인기 무선 이어폰 3종을 비교해보겠습니다.", sceneId: "scene-1" },
  { id: "t2", timestamp: "00:06", text: "어떤 제품이 당신에게 맞을지 함께 살펴봐요.", sceneId: "scene-1" },
  { id: "t3", timestamp: "00:12", text: "첫 번째 제품은 음질이 뛰어나지만 배터리가 짧습니다.", sceneId: "scene-2" },
  { id: "t4", timestamp: "00:20", text: "음악 감상에 집중하는 분께 추천드려요.", sceneId: "scene-2" },
  { id: "t5", timestamp: "00:26", text: "두 번째 제품은 가성비가 최고죠.", sceneId: "scene-3" },
  { id: "t6", timestamp: "00:32", text: "가격 대비 만족도 1위, 입문용으로도 손색없습니다.", sceneId: "scene-3" },
  { id: "t7", timestamp: "00:39", text: "세 번째는 노이즈 캔슬링이 강력합니다.", sceneId: "scene-4" },
  { id: "t8", timestamp: "00:46", text: "출퇴근길 지하철에서 진가를 발휘하죠.", sceneId: "scene-4" },
  { id: "t9", timestamp: "00:52", text: "결론: 본인 사용 패턴에 따라 선택하세요.", sceneId: "scene-5" },
  { id: "t10", timestamp: "01:00", text: "음질, 가성비, 노캔 — 우선순위를 정하면 답이 보입니다.", sceneId: "scene-5" },
  { id: "t11", timestamp: "01:08", text: "더 자세한 정보는 영상 설명란을 확인해주세요.", sceneId: "scene-6" },
  { id: "t12", timestamp: "01:14", text: "좋아요와 구독은 큰 힘이 됩니다.", sceneId: "scene-6" },
];

export const MOCK_SCRIPT = `[오프닝]
안녕하세요, 오늘은 인기 무선 이어폰 3종을 비교해보겠습니다.
어떤 제품이 당신에게 맞을지 함께 살펴봐요.

[1번 제품]
첫 번째 제품은 음질이 뛰어나지만 배터리가 짧습니다.
음악 감상에 집중하는 분께 추천드려요.

[2번 제품 — 가성비왕]
두 번째 제품은 가성비가 최고죠.
가격 대비 만족도 1위, 입문용으로도 손색없습니다.

[3번 제품 — 노캔 끝판왕]
세 번째는 노이즈 캔슬링이 강력합니다.
출퇴근길 지하철에서 진가를 발휘하죠.

[정리]
결론: 본인 사용 패턴에 따라 선택하세요.
음질, 가성비, 노캔 — 우선순위를 정하면 답이 보입니다.

[엔딩]
더 자세한 정보는 영상 설명란을 확인해주세요.
좋아요와 구독은 큰 힘이 됩니다.`;
