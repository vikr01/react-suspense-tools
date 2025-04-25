import * as React from "react";
import { useMemo } from "react";
import { type Fiber } from "react-reconciler";
import createUseHookCallIndex from "create-use-hook-call-index";
import createStructuralId, { type Selector } from "./createStructuralId";

export type * from "./createStructuralId";

const useHookCallIndex = createUseHookCallIndex();

export default function useStructuralId(
  selector: Selector,
  dependencies: ReadonlyArray<unknown>,
): ReturnType<typeof createStructuralId> {
  const hookCallIndex = useHookCallIndex();

  const fiber: Fiber | null =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
    (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.A?.getOwner?.() ??
    null;

  if (fiber == null) {
    throw new Error("Couldn't find an element currently being rendered");
  }

  return useMemo(
    () => createStructuralId(hookCallIndex, fiber, selector),
    dependencies,
  );
}
