import * as React from "react";

export default function createUseHookCallIndex(): () => number {
  let counter = 0;
  let prevFiber: object | null = null;

  return function useHookCallIndex(): number {
    const fiber: object | null =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
      (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.A?.getOwner?.() ??
      null;

    if (fiber == null) {
      throw new Error(
        "useHookCallIndex couldn't find an element currently being rendered",
      );
    }

    if (prevFiber !== fiber) {
      prevFiber = fiber ?? null;
      counter = 0;
    }

    return counter++;
  };
}
