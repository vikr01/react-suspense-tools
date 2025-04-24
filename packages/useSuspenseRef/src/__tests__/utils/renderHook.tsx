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
  suspender?: Promise<void> | typeof fakeContext;
  siblingSuspender?: Promise<void> | typeof fakeContext;
};

type RenderHookReturn<T> = {
  getSuspenseRef: GetRef<T>;
  rerender: Rerender;
  suspend: Suspend;
  suspendSibling: Suspend;
  forceError: ForceError;
  modifyHookComponentKey: () => void;
  modifyTreeKey: () => void;
};

export default function renderHook<T>(useHook: () => T): RenderHookReturn<T> {
  let treeKey = 0;
  let hookComponentKey = 0;

  const useHookWithSuspender = (
    valueForUse: NonNullable<RenderProps["suspender"]>,
  ) => {
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
    { suspender = fakeContext, siblingSuspender = fakeContext }: RenderProps = {
      suspender: fakeContext,
      siblingSuspender: fakeContext,
    },
  ) => (
    <SuspenseComponentTree resetErrorRef={resetErrorRef} key={treeKey}>
      <HookComponent
        hook={() => useHookWithSuspender(suspender)}
        hookValueRef={hookValueRef}
        forceErrorRef={forceErrorRef}
        key={hookComponentKey}
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
      rerender({ suspender: promise });
      return () =>
        act(() => unsuspend().then(() => rerender({ suspender: promise })));
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

  const modifyTreeKey = () => {
    treeKey++;
    rerender();
  };

  const modifyHookComponentKey = () => {
    hookComponentKey++;
    rerender();
  };

  return {
    getSuspenseRef,
    rerender,
    suspend,
    forceError,
    suspendSibling,
    modifyTreeKey,
    modifyHookComponentKey,
  };
}

function SiblingComponent({
  suspender,
}: {
  suspender: Promise<void> | typeof fakeContext;
}) {
  use(suspender);
  return null;
}
