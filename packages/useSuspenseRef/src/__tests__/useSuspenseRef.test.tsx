jest.mock("use-structural-id", () => {
  const useStructuralIdOriginal =
    jest.requireActual("use-structural-id").default;

  return {
    __esModule: true,
    default: jest.fn((...args) => {
      return useStructuralIdOriginal(...args);
    }),
  };
});

import { act, cleanup, screen } from "@testing-library/react";
import useSuspenseRef, { clearSuspenseRefs } from "../useSuspenseRef";
import renderHook from "./utils/renderHook";
import "@testing-library/jest-dom";
import {
  loadingTestId,
  hookElementTestId,
  errorBoundaryFallbackTestId,
} from "./utils/testids.json";
import uncastedUseStructuralId, { Fiber } from "use-structural-id";
import { useState } from "react";
// import createUseMockStructuralId from "./utils/createUseMockStructuralId";
// import { Fiber } from "use-structural-id";

const useStructuralId = uncastedUseStructuralId as unknown as jest.Mock<
  ReturnType<typeof uncastedUseStructuralId>,
  Parameters<typeof uncastedUseStructuralId>
>;

describe("useSuspenseRef", () => {
  afterEach(() => {
    cleanup();
    clearSuspenseRefs();
    useStructuralId.mockClear();
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

    const { getSuspenseRef, forceError } = renderHook(() =>
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

  it("can have multiple promise refs from the same component", async () => {
    const expectedResult1: unique symbol = Symbol(164);
    const expectedResult2: unique symbol = Symbol("abca");
    const expectedResult3: unique symbol = Symbol("foobarbazfoo");
    const expectedResult4: unique symbol = Symbol(Math.random() * 100);

    type RefType1 = typeof expectedResult1 | typeof expectedResult2;
    type RefType2 = typeof expectedResult3 | typeof expectedResult4;

    const { getSuspenseRef, rerender, suspend } = renderHook(() => [
      useSuspenseRef<RefType1>(expectedResult1),
      useSuspenseRef<RefType2>(expectedResult3),
    ]);

    const [suspenseRef1, suspenseRef2] = getSuspenseRef();

    expect(suspenseRef1.current).toBe(expectedResult1);
    expect(suspenseRef2.current).toBe(expectedResult3);

    suspenseRef1.current = expectedResult2;
    suspenseRef2.current = expectedResult4;

    const unsuspend = await suspend();

    rerender();

    await unsuspend();

    expect(suspenseRef1.current).toBe(expectedResult2);
    expect(suspenseRef2.current).toBe(expectedResult4);
  });

  it("does not carry a value across remounts", async () => {
    const expectedResult1: unique symbol = Symbol("bazfoo");
    const expectedResult2: unique symbol = Symbol("foobaz");

    type RefType = typeof expectedResult1 | typeof expectedResult2;

    const { getSuspenseRef, modifyHookComponentKey, modifyTreeKey } =
      renderHook(() => useSuspenseRef<RefType>(expectedResult1));

    const suspenseRef1 = getSuspenseRef();

    suspenseRef1.current = expectedResult2;
    expect(suspenseRef1.current).toBe(expectedResult2);

    modifyHookComponentKey();
    // old element was unmounted, but its ref should stay the same
    expect(suspenseRef1.current).toBe(expectedResult2);

    // You NEED to get the suspense ref again, as this is now a brand new element due to key forcing a REMOUNT
    const suspenseRef2 = getSuspenseRef();
    expect(suspenseRef2.current).toBe(expectedResult1);

    suspenseRef2.current = expectedResult2;
    expect(suspenseRef2.current).toBe(expectedResult2);

    modifyTreeKey();

    // You NEED to get the suspense ref again, as this is now a brand new element due to key forcing a REMOUNT
    const suspenseRef3 = getSuspenseRef();
    expect(suspenseRef3.current).toBe(expectedResult1);
  });

  it("will wipe the value if the structural id changes", async () => {
    let setStructuralId: null | ((strucId: string) => void) = null;

    useStructuralId.mockImplementation(() => {
      const [structuralId, _setStructuralId] = useState<string>(
        "default structural id",
      );
      setStructuralId = _setStructuralId;
      return [structuralId, {}] as ReturnType<typeof uncastedUseStructuralId>;
    });

    const expectedResult1: unique symbol = Symbol("bazfoo");

    type RefType = typeof expectedResult1;

    const { getSuspenseRef } = renderHook(() =>
      useSuspenseRef<RefType>(expectedResult1),
    );

    const suspenseRef = getSuspenseRef();

    expect(suspenseRef.current).toBe(expectedResult1);

    await act<void>(() => {
      setStructuralId?.("next fake structural id");
    });

    // it's destroyed because the structural id changed
    expect(suspenseRef.current).toBeUndefined();

    expect(getSuspenseRef().current).toBe(expectedResult1);
  });

  // it("will wipe the value if the suspense boundary changes", async () => {
  //   let setStructuralId: null | ((strucId: string) => void) = null;

  //   useStructuralId.mockImplementation(() => {
  //     const [structuralId, _setStructuralId] = useState<string>(
  //       "default structural id",
  //     );
  //     setStructuralId = _setStructuralId;
  //     return [structuralId, {}] as ReturnType<typeof uncastedUseStructuralId>;
  //   });

  //   const expectedResult1: unique symbol = Symbol("bazfoo");

  //   type RefType = typeof expectedResult1;

  //   const { getSuspenseRef } = renderHook(() =>
  //     useSuspenseRef<RefType>(expectedResult1),
  //   );

  //   const suspenseRef = getSuspenseRef();

  //   expect(suspenseRef.current).toBe(expectedResult1);

  //   await act<void>(() => {
  //     setStructuralId?.("next fake structural id");
  //   });

  //   // it's destroyed because the structural id changed
  //   expect(suspenseRef.current).toBeUndefined();
  // });
});
