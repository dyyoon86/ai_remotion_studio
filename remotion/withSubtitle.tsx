import React from "react";
import { SubtitleOverlay } from "./SubtitleOverlay";

type AnyProps = Record<string, unknown>;

export function withSubtitle<P extends AnyProps>(Inner: React.FC<P>) {
  const Wrapped: React.FC<P & { narration?: string; accent?: string }> = (
    props,
  ) => (
    <>
      <Inner {...(props as P)} />
      <SubtitleOverlay
        narration={props.narration}
        accent={props.accent as string | undefined}
      />
    </>
  );
  Wrapped.displayName = `withSubtitle(${Inner.displayName ?? Inner.name ?? "Component"})`;
  return Wrapped;
}
