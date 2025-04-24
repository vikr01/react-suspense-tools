import * as React from "react";
import { Suspense } from "react";
import { default as ErrorBoundary } from "./RecoverableErrorBoundary";
import { loadingTestId, errorBoundaryFallbackTestId } from "./testids.json";

export default function SuspenseComponentTree({
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
