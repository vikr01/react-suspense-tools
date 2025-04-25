import * as React from "react";
import type { Fiber } from "react-reconciler";

export default function isErrorBoundary(fiber: Fiber): boolean {
  const elementType = fiber.elementType;

  // Check if the elementType is a class-based component
  if (
    typeof elementType === "function" &&
    elementType.prototype instanceof React.Component
  ) {
    const instance = fiber.stateNode;

    // Check if the class component implements `componentDidCatch`
    if (instance && typeof instance.componentDidCatch === "function") {
      return true; // This is an error boundary
    }
  }

  return false;
}
