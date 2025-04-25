jest.mock("use-suspense-ref", () => {
  const useStructuralIdOriginal =
    jest.requireActual("use-suspense-ref").default;

  return {
    __esModule: true,
    ...useStructuralIdOriginal,
    default: jest.fn((...args) => {
      return useStructuralIdOriginal(...args);
    }),
  };
});

import * as React from "react";
import { use, useImperativeHandle, Suspense } from "react";
import useSuspendable from "../useSuspendable";
import uncastedUseSuspenseRef from "use-suspense-ref";
import { act, cleanup, render, screen } from "@testing-library/react";
import * as testids from "./utils/testids.json";
import createSuspender from "./utils/createSuspender";

const useSuspenseRef = uncastedUseSuspenseRef as unknown as jest.Mock<
  ReturnType<typeof uncastedUseSuspenseRef>,
  Parameters<typeof uncastedUseSuspenseRef>
>;

describe("useSuspendable", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not re-suspend after promise completes", async () => {
    const expectedResult1: unique symbol = Symbol("first result");
    const expectedResult2: unique symbol = Symbol("result 2");
    type ResultTypes = typeof expectedResult1 | typeof expectedResult2;

    const [promise, unsuspend] = createSuspender<ResultTypes>();

    const resultRef: React.RefObject<null | ResultTypes> = { current: null };

    // need to use act while rendering since we suspend on the first go
    const { rerender } = await act(() =>
      render(
        <Component1>
          <TestingComponent
            makePromise={() => promise}
            promiseResultRef={resultRef}
          />
        </Component1>,
      ),
    );

    expect(screen.queryByTestId(testids.testElement)).toBeNull();
    expect(screen.queryByTestId(testids.suspenseFallback)).not.toBeNull();

    await act<void>(async () => {
      unsuspend(expectedResult1);
      await promise;
    });

    expect(resultRef.current).toBe(expectedResult1);

    expect(screen.queryByTestId(testids.testElement)).not.toBeNull();

    expect(screen.queryByTestId(testids.suspenseFallback)).toBeNull();

    const [_promise2, unsuspend2] = createSuspender<ResultTypes>();
    const promise2spy = jest.fn((res) => res);
    const promise2 = _promise2.then(promise2spy);

    // using act just in case it does suspend, which it shouldn't, since the promise is dependent on the structure
    await act<void>(() =>
      rerender(
        <Component1>
          <TestingComponent
            makePromise={() => promise2}
            promiseResultRef={resultRef}
          />
        </Component1>,
      ),
    );

    expect(screen.queryByTestId(testids.testElement)).not.toBeNull();

    expect(screen.queryByTestId(testids.suspenseFallback)).toBeNull();

    await act<void>(async () => {
      unsuspend2(expectedResult2);
      await promise2;
    });

    expect(promise2spy).toHaveBeenCalled();

    const lastSuspenseRef = useSuspenseRef.mock.results[
      useSuspenseRef.mock.results.length - 1
    ].value as ReturnType<typeof useSuspenseRef>;

    expect(lastSuspenseRef.current).toBe(promise);

    expect(resultRef.current).toBe(expectedResult1);
  });

  // it("does work with old throwing style too", () => {});

  // it("does constantly re-suspend if you use a memoized component for suspense", () => {});
});

function TestElement() {
  return <div data-testid={testids.testElement} />;
}

function Component1({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div data-testid={testids.suspenseFallback} />}>
      {children}
    </Suspense>
  );
}

function TestingComponent<T>({
  makePromise,
  promiseResultRef,
  resetRef,
}: {
  makePromise: () => Promise<T>;
  promiseResultRef?: React.Ref<T>;
  resetRef?: React.Ref<() => void>;
}) {
  const { promise: madePromise, reset } = useSuspendable(makePromise);
  const res = use(madePromise);
  useImperativeHandle(promiseResultRef, () => res);
  useImperativeHandle(resetRef, () => reset);

  return <TestElement />;
}
