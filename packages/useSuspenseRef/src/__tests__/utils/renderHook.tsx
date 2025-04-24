import * as React from "react";
import { createContext, use } from "react";
import { act, render } from "@testing-library/react";
import type { GetRef, Rerender, Suspend, ForceError } from "./types";
import SuspenseComponentTree from "./SuspenseComponentTree";
import HookComponent from "./HookComponent";
import createSuspender from "./createSuspender";

const fakeContext = createContext<void>(undefined);

const SENTINEL: unique symbol = Symbol();

export default function renderHook<T>(
  useHook: () => T,
): [GetRef<T>, Rerender, Suspend, ForceError] {
  let valueForUse: Promise<void> | typeof fakeContext = fakeContext;

  const useHookWithSuspender = () => {
    const res = useHook();
    use(valueForUse);

    return res;
  };

  const hookValueRef: React.RefObject<typeof SENTINEL | T> = {
    current: SENTINEL,
  };

  const resetErrorRef: React.RefObject<null | (() => void)> = {
    current: null,
  };

  const forceErrorRef: React.RefObject<null | (() => void)> = {
    current: null,
  };

  const makeElement = () => (
    <SuspenseComponentTree resetErrorRef={resetErrorRef}>
      <HookComponent
        hook={useHookWithSuspender}
        hookValueRef={hookValueRef}
        forceErrorRef={forceErrorRef}
      />
    </SuspenseComponentTree>
  );

  const renderResult = render(makeElement());

  if (hookValueRef.current === SENTINEL) {
    throw new Error("hook was never set");
  }

  const getResult = () => {
    const res = hookValueRef.current;

    if (res === SENTINEL) {
      throw new Error("ref was never set");
    }

    return res;
  };

  const rerender = () => {
    renderResult.rerender(makeElement());
  };

  const suspend = () =>
    act(() => {
      const [promise, unsuspend] = createSuspender();
      hookValueRef.current = SENTINEL;
      valueForUse = promise;

      rerender();
      return () => act(() => unsuspend().then(rerender));
    });

  function handleTopLevelError(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const forceError = async () => {
    window.addEventListener("error", handleTopLevelError); // silencing the forced error
    await act<void>(() => forceErrorRef.current?.());
    window.removeEventListener("error", handleTopLevelError);

    const resetError = () =>
      act<void>(() => {
        resetErrorRef.current?.();
      });

    return resetError;
  };

  return [getResult, rerender, suspend, forceError];
}
