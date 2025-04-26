import createFiber from "./utils/createFiber";
import * as React from "react";
import { Suspense } from "react";
import isSuspense from "../isSuspense";
import isErrorBoundary from "../isErrorBoundary";

describe("react-fiber-identifiers", () => {
  describe("isSuspense", () => {
    it("returns true when it's a suspense fiber", () => {
      const fiber = createFiber(<Suspense />);

      expect(isSuspense(fiber)).toBe(true);
    });

    it("returns false when it's NOT a suspense fiber", () => {
      const fiber1 = createFiber(<React.Fragment />);

      expect(fiber1).toBeNull();

      expect(isSuspense(fiber1)).toBe(false);

      const ComponentUsingSuspense = (
        props: React.ComponentProps<typeof Suspense>,
      ) => <Suspense {...props} />;

      const fiber2 = createFiber(<ComponentUsingSuspense />);

      expect(isSuspense(fiber2)).toBe(false);
    });
  });

  describe("isErrorBoundary", () => {
    class ErrorBoundaryClassWithDerivedState extends React.Component {
      static getDerivedStateFromError() {
        return {};
      }

      render = () => null;
    }

    class ErrorBoundaryClassWithCatch extends React.Component {
      componentDidCatch() {}

      render = () => null;
    }

    class CustomErrorBoundary extends ErrorBoundaryClassWithCatch {
      render = () => null;
    }

    class NonErrorBoundary extends React.Component {
      render = () => null;
    }

    it("recognizes class-based error boundaries with getDerivedStateFromError", () => {
      const fiber = createFiber(<ErrorBoundaryClassWithDerivedState />);

      expect(isErrorBoundary(fiber)).toBe(true);
    });

    it("recognizes class-based error boundaries with componentDidCatch", () => {
      const fiber = createFiber(<ErrorBoundaryClassWithCatch />);

      expect(isErrorBoundary(fiber)).toBe(true);
    });

    it("recognizes class components that extend an error boundary component", () => {
      const fiber = createFiber(<CustomErrorBoundary />);

      expect(isErrorBoundary(fiber)).toBe(true);
    });

    it("returns false for class components without any error related methods", () => {
      const fiber = createFiber(<NonErrorBoundary />);

      expect(isErrorBoundary(fiber)).toBe(false);
    });
  });
});
