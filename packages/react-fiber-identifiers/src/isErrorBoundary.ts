import * as React from "react";
import type { Fiber } from "react-reconciler";

export default function isErrorBoundary(fiber: Fiber | null): boolean {
  if (fiber == null) {
    return false;
  }

  const elementType = fiber.elementType;

  // Check if the elementType is a class-based component
  if (elementType?.prototype instanceof React.Component) {
    const instance = fiber.elementType;

    if (instance == null) {
      return false;
    }

    return (
      typeof instance.prototype.componentDidCatch === "function" ||
      typeof instance.getDerivedStateFromError === "function"
    );
  }

  return false;
}
