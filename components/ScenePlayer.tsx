"use client";

import { Player } from "@remotion/player";
import { useMemo } from "react";
import type { Scene } from "@/lib/store";
import {
  TEMPLATE_COMPONENT,
  buildInputProps,
  TEMPLATE_DURATION,
  TEMPLATE_FPS,
  TEMPLATE_WIDTH,
  TEMPLATE_HEIGHT,
} from "@/remotion/registry";

type Props = {
  scene: Scene;
  width: number;
  height: number;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
};

export function ScenePlayer({
  scene,
  width,
  height,
  controls = false,
  autoPlay = true,
  loop = true,
  className,
}: Props) {
  const Component = TEMPLATE_COMPONENT[scene.template];
  const inputProps = useMemo(() => buildInputProps(scene), [scene]);

  return (
    <div className={className} style={{ width, height, overflow: "hidden", borderRadius: 8 }}>
      <Player
        component={Component}
        inputProps={inputProps}
        durationInFrames={TEMPLATE_DURATION}
        compositionWidth={TEMPLATE_WIDTH}
        compositionHeight={TEMPLATE_HEIGHT}
        fps={TEMPLATE_FPS}
        autoPlay={autoPlay}
        loop={loop}
        controls={controls}
        style={{ width: "100%", height: "100%" }}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
