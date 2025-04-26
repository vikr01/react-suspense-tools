import * as React from "react";
import { Suspense } from "react";
import { createFiberFromElement } from "@gitpkg/react-reconciler/src/ReactFiber";
import isSuspense from "../isSuspense";
import type { Fiber } from "react-reconciler";

describe("isSuspense", () => {
  it("correctly identifies a suspense fiber node", () => {
    const fiber = createFiberFromElement(<Suspense />);

    expect(isSuspense(fiber as unknown as Fiber)).toBe(true);
  });
});
