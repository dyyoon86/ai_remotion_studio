import { Tag } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function LogoPage() {
  return (
    <PlaceholderPage
      title="브랜드 로고 등록"
      description="채널별 로고와 워터마크를 한 번 등록해두면 모든 영상에 자동 삽입됩니다. SVG · PNG · WebP를 지원하며 위치·크기·투명도까지 세밀하게 제어할 수 있습니다."
      icon={<Tag size={38} strokeWidth={1.5} />}
      accent="#f59e0b"
    />
  );
}
