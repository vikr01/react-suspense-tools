import * as React from "react";
import type { Fiber } from "react-reconciler";

export default function isSuspense(fiber: Fiber) {
  return fiber.elementType === React.Suspense;
}
