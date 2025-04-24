import * as React from "react";
import { useImperativeHandle } from "react";
import { hookElementTestId } from "./testids.json";

export default function HookComponent<T>({
  hook: useHook,
  hookValueRef,
  forceErrorRef,
}: {
  hook: () => T;
  hookValueRef: React.Ref<T>;
  forceErrorRef: React.Ref<unknown | (() => void)>;
}) {
  const [state, setState] = React.useState(false);
  if (state === true) {
    throw new Error("forced an error");
  }
  const res = useHook();
  useImperativeHandle(hookValueRef, () => res);
  useImperativeHandle(forceErrorRef, () => () => {
    setState(true);
  });

  return <div data-testid={hookElementTestId} />;
}
