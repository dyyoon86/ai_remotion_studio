import { Clock3 } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function HistoryPage() {
  return (
    <PlaceholderPage
      title="렌더링 히스토리"
      description="이전에 렌더링한 영상의 메타데이터, 다운로드 링크, 재편집 옵션이 모두 한곳에 정리됩니다. 프로젝트별 필터와 일괄 내보내기도 지원할 예정입니다."
      icon={<Clock3 size={38} strokeWidth={1.5} />}
      accent="#22d3ee"
    />
  );
}
