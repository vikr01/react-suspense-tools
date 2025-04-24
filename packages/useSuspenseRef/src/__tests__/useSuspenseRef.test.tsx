/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { createContext, use, useImperativeHandle, Suspense } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import useSuspenseRef, { clearSuspenseRefs } from "../useSuspenseRef";
import { default as ErrorBoundary } from "./utils/RecoverableErrorBoundary";
import "@testing-library/jest-dom";

const loadingTestId = "loader1";
const hookElementTestId = "hook-element";
const errorBoundaryFallbackTestId = "error-boundary-fallback";

describe("useSuspenseRef", () => {
  afterEach(() => {
    cleanup();
    clearSuspenseRefs();
  });

  it("can maintain an initialized value", () => {
    const expectedResult = {};

    const [getSuspenseRef, rerender] = renderHook(() =>
      useSuspenseRef(expectedResult),
    );

    const suspenseRef = getSuspenseRef();

    expect(suspenseRef.current).toBe(expectedResult);

    rerender();

    expect(suspenseRef.current).toBe(expectedResult);
  });

  it("can maintain a modified value", () => {
    const expectedResult1: unique symbol = Symbol(1);
    const expectedResult2: unique symbol = Symbol(2);

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const [getSuspenseRef, rerender] = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    const suspenseRef = getSuspenseRef();

    expect(suspenseRef.current).toBe(expectedResult1);

    suspenseRef.current = expectedResult2;

    expect(suspenseRef.current).toBe(expectedResult2);

    rerender();

    expect(suspenseRef.current).toBe(expectedResult2);
  });

  it("can maintain a value across suspends", async () => {
    const expectedResult1: unique symbol = Symbol(1);
    const expectedResult2: unique symbol = Symbol(2);

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const [getSuspenseRef, , suspend] = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    const suspenseRef1 = getSuspenseRef();

    suspenseRef1.current = expectedResult2;

    expect(screen.queryByTestId(loadingTestId)).toBeNull();

    const unsuspend = await suspend();

    expect(screen.queryByTestId(loadingTestId)).not.toBeNull();

    await unsuspend();

    expect(suspenseRef1.current).toBe(expectedResult2);

    expect(screen.queryByTestId(loadingTestId)).toBeNull();

    const suspenseRef2 = getSuspenseRef();
    /**
     * react testing library doesn't truly suspend,
     * it just sets display: none and *hides* the existing element.
     * So, we can't actually test that the pointers of suspenseRef1 and suspenseRef 2 are different,
     * because they are the same, since the React element was never taken out of the DOM
     */

    expect(suspenseRef2.current).toBe(suspenseRef1.current);
  });

  it("re-initializes the ref if the component is destroyed via error", async () => {
    const expectedResult1: unique symbol = Symbol(5);
    const expectedResult2: unique symbol = Symbol(10);

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const [getSuspenseRef, rerender, , forceError] = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    const suspenseRef = getSuspenseRef();

    suspenseRef.current = expectedResult2;

    expect(screen.queryByTestId(hookElementTestId)).not.toBeNull();

    const resetError = await forceError();

    // The suspense ref should stay as expectedResult2 until the element is re-initialized
    expect(suspenseRef.current).toBe(expectedResult2);
    expect(screen.queryByTestId(hookElementTestId)).toBeNull();

    expect(screen.queryByTestId(errorBoundaryFallbackTestId)).not.toBeNull();

    await resetError();

    expect(screen.queryByTestId(errorBoundaryFallbackTestId)).toBeNull();
    expect(screen.queryByTestId(hookElementTestId)).not.toBeNull();

    // Since we passed expectedResult1 into the hook as the initializer, upon recreation after error it will be this again
    expect(suspenseRef.current).toBe(expectedResult1);
  });

  // it("destroys the ref if the structure changes", () => {});

  // it("preserves the ref when it suspends to do another component suspending", () => {});

  // it("can have multiple promise refs from the same component", () => {});
});

function SuspenseComponentTree({
  children,
  resetErrorRef,
}: {
  children: React.ReactNode;
  resetErrorRef: React.ComponentPropsWithoutRef<
    typeof ErrorBoundary
  >["resetErrorRef"];
}) {
  return (
    <div data-testid="root-div">
      <Suspense fallback={<div data-testid="unused-loader" />}>
        <Suspense fallback={<div data-testid={loadingTestId} />}>
          <ErrorBoundary
            fallback={<div data-testid={errorBoundaryFallbackTestId} />}
            resetErrorRef={resetErrorRef}
          >
            {children}
          </ErrorBoundary>
        </Suspense>
      </Suspense>
    </div>
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

const fakeContext = createContext<void>(undefined);

const SENTINEL: unique symbol = Symbol();

type GetRef<T> = () => T;
type Rerender = () => void;
type Unsuspend = () => Promise<void>;
type Suspend = () => Promise<Unsuspend>;
type ResetError = () => Promise<void>;
type ForceError = () => Promise<ResetError>;

function renderHook<T>(
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

type Resolve = null | ((...args: unknown[]) => unknown);

function createSuspender(): [Promise<void>, Unsuspend] {
  let resolve: Resolve = null;

  const promise = new Promise((_resolve) => {
    resolve = _resolve;
    return;
  }).then(() => {});

  const unsuspend = async () => {
    resolve?.();
    await promise;
  };

  return [promise, unsuspend];
}
