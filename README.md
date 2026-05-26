# Remotion AI Studio

Next.js + Remotion 기반 AI 비디오 스튜디오. 영상 업로드 → 대본 입력 → 음성 인식/AI 장면 분석 → 템플릿 매핑 → 렌더링까지 단계별 워크플로우를 제공한다.

## Stack

- **Next.js 16** (App Router) + React 19
- **Remotion 4** + `@remotion/player` (브라우저 프리뷰)
- **Zustand** (상태 관리)
- **Tailwind CSS 4**
- **TypeScript 5**

## Workflow

5단계 스테퍼 기반:

1. **업로드** — 소스 영상 등록
2. **대본 입력** — 나레이션/스크립트 작성
3. **음성 인식 + AI 분석** — STT 및 장면 분리
4. **파이널 리뷰** — 씬별 템플릿/메타데이터/액센트 색상 확인
5. **렌더링** — Remotion 컴포지션으로 출력

## Templates

`remotion/registry.ts` 에 등록된 4종 (1920×1080 / 30fps / 기본 90프레임):

| ID | 라벨 | 컴포넌트 |
|----|------|----------|
| `intro` | 인트로 | `IntroTemplate` |
| `comparison` | 비교분석 | `ComparisonTemplate` |
| `highlight` | 텍스트강조 | `TextHighlightTemplate` |
| `imagecard` | 이미지카드 | `ImageCardTemplate` |

## Getting Started

```bash
npm install
npm run dev
```

http://localhost:3000 에 접속.

## Scripts

| 명령 | 동작 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 |

## Project Layout

```
app/              # Next.js App Router (page, layout, templates/, history/, logo/)
components/       # DashboardShell, Sidebar, TopStepper, ScenePlayer, steps/
remotion/         # Root.tsx, registry.ts, *Template.tsx
lib/              # store.ts (Zustand), mock-data.ts, cn.ts
```

## Notes

- 이 저장소의 Next.js 는 학습 데이터 시점과 다른 API/관례를 사용한다. 작업 전에 `node_modules/next/dist/docs/` 의 가이드를 확인할 것 (`AGENTS.md` 참고).
