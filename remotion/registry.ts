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
import { withSubtitle } from "./withSubtitle";
import type { Scene, TemplateId } from "@/lib/store";

type Comp = React.FC<{
  title?: string;
  subtitle?: string;
  accent?: string;
  productA?: string;
  productB?: string;
  imageUrl?: string;
  image?: string;
  narration?: string;
}>;

export const TEMPLATE_COMPONENT: Record<TemplateId, Comp> = {
  comparison: withSubtitle(ComparisonTemplate as Comp) as Comp,
  intro: withSubtitle(IntroTemplate as Comp) as Comp,
  highlight: withSubtitle(TextHighlightTemplate as Comp) as Comp,
  imagecard: withSubtitle(ImageCardTemplate as Comp) as Comp,
  flowSteps: withSubtitle(FlowStepsTemplate as Comp) as Comp,
  keywordImpact: withSubtitle(KeywordImpactTemplate as Comp) as Comp,
  gridCard: withSubtitle(GridCardTemplate as Comp) as Comp,
  numberList: withSubtitle(NumberListTemplate as Comp) as Comp,
  layerStack: withSubtitle(LayerStackTemplate as Comp) as Comp,
  bidirectional: withSubtitle(BidirectionalTemplate as Comp) as Comp,
  chatInterface: withSubtitle(ChatInterfaceTemplate as Comp) as Comp,
  phoneChat: withSubtitle(PhoneChatTemplate as Comp) as Comp,
  gaugeMeter: withSubtitle(GaugeMeterTemplate as Comp) as Comp,
  treeExplorer: withSubtitle(TreeExplorerTemplate as Comp) as Comp,
  multiPanelDash: withSubtitle(MultiPanelDashTemplate as Comp) as Comp,
  premiumIntro: withSubtitle(PremiumIntroTemplate as Comp) as Comp,
  floatingCard3D: withSubtitle(FloatingCard3DTemplate as Comp) as Comp,
  premiumMetric: withSubtitle(PremiumMetricTemplate as Comp) as Comp,
  gridExplosion: withSubtitle(GridExplosionTemplate as Comp) as Comp,
  kineticTypo: withSubtitle(KineticTypoTemplate as Comp) as Comp,
  redditStory: withSubtitle(RedditStoryTemplate as Comp) as Comp,
  imageEmphasis: withSubtitle(ImageEmphasisTemplate as Comp) as Comp,
  imageEmphasisV2: withSubtitle(ImageEmphasisV2Template as Comp) as Comp,
  logoBrand: withSubtitle(LogoBrandTemplate as Comp) as Comp,
  premiumFunnel: withSubtitle(PremiumFunnelTemplate as Comp) as Comp,
  strategicBlueprint: withSubtitle(StrategicBlueprintTemplate as Comp) as Comp,
  orbitTimeline: withSubtitle(OrbitTimelineTemplate as Comp) as Comp,
  logicFlow: withSubtitle(LogicFlowTemplate as Comp) as Comp,
  hologramCore: withSubtitle(HologramCoreTemplate as Comp) as Comp,
  cinematicMatrix: withSubtitle(CinematicMatrixTemplate as Comp) as Comp,
  quantumSingularity: withSubtitle(QuantumSingularityTemplate as Comp) as Comp,
  logoDualSnap: withSubtitle(LogoDualSnapTemplate as Comp) as Comp,
  logoClone: withSubtitle(LogoCloneTemplate as Comp) as Comp,
  logoMetrics: withSubtitle(LogoMetricsTemplate as Comp) as Comp,
  kineticCompact: withSubtitle(KineticCompactTemplate as Comp) as Comp,
  comparisonV2: withSubtitle(ComparisonV2Template as Comp) as Comp,
};

export function buildInputProps(scene: Scene) {
  const base = {
    title: scene.titleMeta || scene.title,
    subtitle: scene.subtitleMeta,
    accent: scene.accentColor,
    narration: scene.narration,
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
  if (scene.template === "imageEmphasis" || scene.template === "imageEmphasisV2") {
    // These components consume `image` rather than `imageUrl`
    return { ...base, image: scene.image };
  }
  if (scene.template === "comparisonV2") {
    return {
      ...base,
      productA: "Option A",
      productB: "Option B",
    };
  }
  if (scene.template === "logoDualSnap") {
    return {
      ...base,
      productA: "Brand A",
      productB: "Brand B",
    };
  }
  return base;
}

export const TEMPLATE_DURATION = 90;
export const TEMPLATE_FPS = 30;
export const TEMPLATE_WIDTH = 1920;
export const TEMPLATE_HEIGHT = 1080;
