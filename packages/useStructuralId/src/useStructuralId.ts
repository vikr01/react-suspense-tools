import * as React from "react";
import { traverseFiber, type Fiber } from "its-fine";
import { useMemo } from "react";
import createUseHookCallIndex from "create-use-hook-call-index";
import { createArrayIdWithNumber } from "./createStructuralId";
import type { Writable } from "type-fest";

const useHookCallIndex = createUseHookCallIndex();

export type { Fiber };
export type Selector = null | Parameters<typeof traverseFiber>[2];
export type StructuralId = string;
export type StopNode = Fiber | null;

export default function useStructuralId(
  selector: Selector,
  dependencies: ReadonlyArray<unknown>,
): [StructuralId, StopNode] {
  const hookCallIndex = useHookCallIndex();

  const fiber: Fiber | null =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
    (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.A?.getOwner?.() ??
    null;

  if (fiber == null) {
    throw new Error("Couldn't find an element currently being rendered");
  }

  return useMemo(() => {
    const structuralNodes: Writable<
      Parameters<typeof createArrayIdWithNumber>[1]
    > = [];

    const stopNode =
      traverseFiber(fiber, true, function (node, ...args) {
        structuralNodes.push([node.elementType, node.key ?? node.index]);
        return selector?.(node, ...args);
      }) ?? null;

    const structuralId = createArrayIdWithNumber(
      hookCallIndex,
      structuralNodes,
    );

    return [structuralId, stopNode];
  }, dependencies);
}
