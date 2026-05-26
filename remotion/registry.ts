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
import type { Scene, TemplateId } from "@/lib/store";

type Comp = React.FC<{
  title?: string;
  subtitle?: string;
  accent?: string;
  productA?: string;
  productB?: string;
  imageUrl?: string;
  image?: string;
}>;

export const TEMPLATE_COMPONENT: Record<TemplateId, Comp> = {
  comparison: ComparisonTemplate as Comp,
  intro: IntroTemplate as Comp,
  highlight: TextHighlightTemplate as Comp,
  imagecard: ImageCardTemplate as Comp,
  flowSteps: FlowStepsTemplate as Comp,
  keywordImpact: KeywordImpactTemplate as Comp,
  gridCard: GridCardTemplate as Comp,
  numberList: NumberListTemplate as Comp,
  layerStack: LayerStackTemplate as Comp,
  bidirectional: BidirectionalTemplate as Comp,
  chatInterface: ChatInterfaceTemplate as Comp,
  phoneChat: PhoneChatTemplate as Comp,
  gaugeMeter: GaugeMeterTemplate as Comp,
  treeExplorer: TreeExplorerTemplate as Comp,
  multiPanelDash: MultiPanelDashTemplate as Comp,
  premiumIntro: PremiumIntroTemplate as Comp,
  floatingCard3D: FloatingCard3DTemplate as Comp,
  premiumMetric: PremiumMetricTemplate as Comp,
  gridExplosion: GridExplosionTemplate as Comp,
  kineticTypo: KineticTypoTemplate as Comp,
  redditStory: RedditStoryTemplate as Comp,
  imageEmphasis: ImageEmphasisTemplate as Comp,
  imageEmphasisV2: ImageEmphasisV2Template as Comp,
  logoBrand: LogoBrandTemplate as Comp,
  premiumFunnel: PremiumFunnelTemplate as Comp,
  strategicBlueprint: StrategicBlueprintTemplate as Comp,
  orbitTimeline: OrbitTimelineTemplate as Comp,
  logicFlow: LogicFlowTemplate as Comp,
  hologramCore: HologramCoreTemplate as Comp,
  cinematicMatrix: CinematicMatrixTemplate as Comp,
  quantumSingularity: QuantumSingularityTemplate as Comp,
  logoDualSnap: LogoDualSnapTemplate as Comp,
  logoClone: LogoCloneTemplate as Comp,
  logoMetrics: LogoMetricsTemplate as Comp,
  kineticCompact: KineticCompactTemplate as Comp,
  comparisonV2: ComparisonV2Template as Comp,
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
