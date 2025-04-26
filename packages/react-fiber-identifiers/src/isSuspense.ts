import * as React from "react";
import type { Fiber } from "react-reconciler";

export default function isSuspense(fiber: Fiber | null) {
  return fiber?.elementType === React.Suspense;
}
