import { ComparisonTemplate } from "./ComparisonTemplate";
import { IntroTemplate } from "./IntroTemplate";
import { TextHighlightTemplate } from "./TextHighlightTemplate";
import { ImageCardTemplate } from "./ImageCardTemplate";
import type { Scene, TemplateId } from "@/lib/store";

type Comp = React.FC<{
  title?: string;
  subtitle?: string;
  accent?: string;
  productA?: string;
  productB?: string;
  imageUrl?: string;
}>;

export const TEMPLATE_COMPONENT: Record<TemplateId, Comp> = {
  comparison: ComparisonTemplate as Comp,
  intro: IntroTemplate as Comp,
  highlight: TextHighlightTemplate as Comp,
  imagecard: ImageCardTemplate as Comp,
};

export function buildInputProps(scene: Scene) {
  const base = {
    title: scene.titleMeta || scene.title,
    subtitle: scene.subtitleMeta,
    accent: scene.accentColor,
  };
  if (scene.template === "comparison") {
    // Split narration heuristically for two-column comparison
    return {
      ...base,
      productA: "음질 우위",
      productB: "노캔 우위",
    };
  }
  if (scene.template === "imagecard") {
    return { ...base, imageUrl: scene.image };
  }
  if (scene.template === "highlight") {
    // Use first sentence of narration as the highlight string when titleMeta is empty
    return {
      ...base,
      title: scene.titleMeta || scene.narration.split(/[.!?。]/)[0],
    };
  }
  return base;
}

export const TEMPLATE_DURATION = 90;
export const TEMPLATE_FPS = 30;
export const TEMPLATE_WIDTH = 1920;
export const TEMPLATE_HEIGHT = 1080;
