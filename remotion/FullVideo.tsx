import React from "react";
import { Series } from "remotion";
import { TEMPLATE_COMPONENT, buildInputProps } from "./registry";
import type { Scene } from "@/lib/store";

export const FRAMES_PER_SCENE = 90;

type FullVideoProps = { scenes: Scene[] };

export const FullVideo: React.FC<FullVideoProps> = ({ scenes }) => {
  if (!scenes?.length) return null;
  return (
    <Series>
      {scenes.map((scene) => {
        const Comp = TEMPLATE_COMPONENT[scene.template];
        const props = buildInputProps(scene);
        return (
          <Series.Sequence key={scene.id} durationInFrames={FRAMES_PER_SCENE}>
            <Comp {...props} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
