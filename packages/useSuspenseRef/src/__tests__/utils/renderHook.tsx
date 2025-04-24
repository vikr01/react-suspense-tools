import * as React from "react";
import { createContext, use } from "react";
import { act, render } from "@testing-library/react";
import type { GetRef, Rerender, Suspend, ForceError } from "./types";
import SuspenseComponentTree from "./SuspenseComponentTree";
import HookComponent from "./HookComponent";
import createSuspender from "./createSuspender";

const fakeContext = createContext<void>(undefined);

const SENTINEL: unique symbol = Symbol();

type RenderProps = {
  siblingSuspender: Promise<void> | typeof fakeContext;
};

type RenderHookReturn<T> = {
  getSuspenseRef: GetRef<T>;
  rerender: Rerender;
  suspend: Suspend;
  suspendSibling: Suspend;
  forceError: ForceError;
};

export default function renderHook<T>(useHook: () => T): RenderHookReturn<T> {
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

  const makeElement = (
    { siblingSuspender }: RenderProps = { siblingSuspender: fakeContext },
  ) => (
    <SuspenseComponentTree resetErrorRef={resetErrorRef}>
      <HookComponent
        hook={useHookWithSuspender}
        hookValueRef={hookValueRef}
        forceErrorRef={forceErrorRef}
      />
      <SiblingComponent suspender={siblingSuspender} />
    </SuspenseComponentTree>
  );

  const renderResult = render(makeElement());

  if (hookValueRef.current === SENTINEL) {
    throw new Error("hook was never set");
  }

  const getSuspenseRef = () => {
    const res = hookValueRef.current;

    if (res === SENTINEL) {
      throw new Error("ref was never set");
    }

    return res;
  };

  const rerender = (renderProps?: RenderProps) => {
    renderResult.rerender(makeElement(renderProps));
  };

  const suspend = () =>
    act(() => {
      const [promise, unsuspend] = createSuspender();
      hookValueRef.current = SENTINEL;
      valueForUse = promise;

      rerender();
      return () => act(() => unsuspend().then(() => rerender()));
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

  const suspendSibling = () =>
    act(async () => {
      const [promise, unsuspend] = createSuspender();

      rerender({ siblingSuspender: promise });

      return () =>
        act(() =>
          unsuspend().then(() => rerender({ siblingSuspender: promise })),
        );
    });

  return { getSuspenseRef, rerender, suspend, forceError, suspendSibling };
}

function SiblingComponent({
  suspender,
}: {
  suspender: Promise<void> | typeof fakeContext;
}) {
  use(suspender);
  return null;
}
