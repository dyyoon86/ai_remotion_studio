import React from "react";
import { Series } from "remotion";
import { TEMPLATE_COMPONENT, buildInputProps } from "./registry";
import type { Scene } from "@/lib/store";

export const DEFAULT_FRAMES_PER_SCENE = 90;
/** @deprecated Use DEFAULT_FRAMES_PER_SCENE — kept for back-compat. */
export const FRAMES_PER_SCENE = DEFAULT_FRAMES_PER_SCENE;

type FullVideoProps = { scenes: Scene[] };

export const FullVideo: React.FC<FullVideoProps> = ({ scenes }) => {
  if (!scenes?.length) return null;
  return (
    <Series>
      {scenes.map((scene) => {
        const Comp = TEMPLATE_COMPONENT[scene.template];
        const props = buildInputProps(scene);
        const frames =
          scene.durationFrames && scene.durationFrames > 0
            ? scene.durationFrames
            : DEFAULT_FRAMES_PER_SCENE;
        return (
          <Series.Sequence key={scene.id} durationInFrames={frames}>
            <Comp {...props} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
