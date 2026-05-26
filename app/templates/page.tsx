import { LayoutTemplate } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function TemplatesPage() {
  return (
    <PlaceholderPage
      title="템플릿 라이브러리"
      description="비교분석, 인트로, 텍스트강조, 이미지카드 외 더 많은 영상 템플릿이 곧 추가됩니다. 직접 템플릿을 업로드하고 공유할 수 있는 마켓플레이스도 준비 중입니다."
      icon={<LayoutTemplate size={38} strokeWidth={1.5} />}
      accent="#8b5cf6"
    />
  );
}
