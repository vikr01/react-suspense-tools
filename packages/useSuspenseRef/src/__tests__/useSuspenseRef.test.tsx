/* eslint-disable @typescript-eslint/no-unused-vars */
import { cleanup, screen } from "@testing-library/react";
import useSuspenseRef, { clearSuspenseRefs } from "../useSuspenseRef";
import renderHook from "./utils/renderHook";
import "@testing-library/jest-dom";
import {
  loadingTestId,
  hookElementTestId,
  errorBoundaryFallbackTestId,
} from "./utils/testids.json";

describe("useSuspenseRef", () => {
  afterEach(() => {
    cleanup();
    clearSuspenseRefs();
  });

  it("can maintain an initialized value", () => {
    const expectedResult = {};

    const { getSuspenseRef, rerender } = renderHook(() =>
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

    const { getSuspenseRef, rerender } = renderHook(() =>
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

    const { getSuspenseRef, suspend } = renderHook(() =>
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
     * So, we can't actually test that the pointers of suspenseRef1 and suspenseRef2 are different,
     * because they are the same, since the React element was never taken out of the DOM
     * expect(suspenseRef2).not.toBe(suspenseRef1);
     */

    expect(suspenseRef2.current).toBe(suspenseRef1.current);
  });

  it("re-initializes the ref if the component is destroyed via error", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const expectedResult1: unique symbol = Symbol(5);
    const expectedResult2: unique symbol = Symbol(10);

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const { getSuspenseRef, rerender, forceError } = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    const suspenseRef = getSuspenseRef();

    suspenseRef.current = expectedResult2;

    expect(screen.queryByTestId(hookElementTestId)).not.toBeNull();

    const resetError = await forceError();

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();

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

  // it("re-initializes the ref if the structure changes", () => {});

  it("preserves the ref when it suspends due to another component suspending", async () => {
    const expectedResult1: unique symbol = Symbol(1);
    const expectedResult2: unique symbol = Symbol(2);

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const { getSuspenseRef, suspendSibling } = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    const suspenseRef1 = getSuspenseRef();

    suspenseRef1.current = expectedResult2;

    expect(screen.queryByTestId(loadingTestId)).toBeNull();

    const unsuspend = await suspendSibling();

    expect(screen.queryByTestId(loadingTestId)).not.toBeNull();

    await unsuspend();

    expect(suspenseRef1.current).toBe(expectedResult2);

    expect(screen.queryByTestId(loadingTestId)).toBeNull();

    const suspenseRef2 = getSuspenseRef();

    expect(suspenseRef2.current).toBe(suspenseRef1.current);
  });

  // it("can have multiple promise refs from the same component", () => {});
});
