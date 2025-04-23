/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useImperativeHandle, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { render } from "@testing-library/react";
import useSuspenseRef, { clearSuspenseRefs } from "../useSuspenseRef";

describe("useSuspenseRef", () => {
  afterEach(() => {
    clearSuspenseRefs();
  });

  it("can maintain an initialized value", () => {
    const expectedResult = {};

    const [suspenseRef, rerender] = renderHook(() =>
      useSuspenseRef(expectedResult),
    );

    expect(suspenseRef.current).toBe(expectedResult);

    rerender();

    expect(suspenseRef.current).toBe(expectedResult);
  });

  it("can maintain a modified value", () => {
    const expectedResult1: unique symbol = Symbol(1);
    const expectedResult2: unique symbol = Symbol(2);

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const [suspenseRef, rerender] = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    expect(suspenseRef.current).toBe(expectedResult1);

    suspenseRef.current = expectedResult2;

    expect(suspenseRef.current).toBe(expectedResult2);

    rerender();

    expect(suspenseRef.current).toBe(expectedResult2);
  });

  // it("can store a value across suspends", async () => {
  //   const expectedResult1: unique symbol = Symbol();
  //   const expectedResult2: unique symbol = Symbol();

  //   type RefType = typeof expectedResult1 | typeof expectedResult2;

  //   const [suspenseRef, , suspend] = renderHook(() =>
  //     useSuspenseRef<RefType>(expectedResult1),
  //   );

  //   suspenseRef.current = expectedResult2;
  // });

  // it("destroys the ref if the component is destroyed via error", () => {});

  // it("destroys the ref if the structure changes", () => {});

  // it("preserves the ref when it suspends to do another component suspending", () => {});
});

function SuspenseComponentTree({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div data-testid="unused-loader" />}>
      <Suspense fallback={<div data-testid="loader1" />}>
        <ErrorBoundary fallback={<div data-test-id="error1" />}>
          {children}
        </ErrorBoundary>
      </Suspense>
    </Suspense>
  );
}

function useSuspenseRefTwice<T, V>(
  init1: T,
  init2: V,
): [
  ReturnType<typeof useSuspenseRef<T>>,
  ReturnType<typeof useSuspenseRef<V>>,
] {
  const res1 = useSuspenseRef<T>(init1);
  const res2 = useSuspenseRef<V>(init2);

  return [res1, res2];
}

function HookComponent<T>({
  hook: useHook,
  hookValueRef,
}: {
  hook: () => T;
  hookValueRef: React.Ref<T>;
}) {
  const res = useHook();
  useImperativeHandle(hookValueRef, () => res);

  return null;
}

const SENTINEL: unique symbol = Symbol();

function renderHook<T>(hook: () => T): [T, () => void] {
  const hookValueRef: React.RefObject<typeof SENTINEL | T> = {
    current: SENTINEL,
  };

  const renderResult = render(
    <SuspenseComponentTree>
      <HookComponent hook={hook} hookValueRef={hookValueRef} />
    </SuspenseComponentTree>,
  );

  if (hookValueRef.current === SENTINEL) {
    throw new Error("hook was never set");
  }

  const rerender = () => {
    renderResult.rerender(
      <SuspenseComponentTree>
        <HookComponent hook={hook} hookValueRef={hookValueRef} />
      </SuspenseComponentTree>,
    );
  };

  return [hookValueRef.current, rerender];
}
