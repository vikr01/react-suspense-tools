import { traverseFiber, type Fiber as FineFiber } from "its-fine";
import type { Fiber } from "react-reconciler";
import getUniqueIdentifier from "react-fiber-identifiers/get-unique-identifier";

export type Selector = null | Parameters<typeof traverseFiber>[2];
export type StructuralId = string;
export type StopNode = Fiber | null;
export type { Fiber };

function createStructuralId(
  fiber: Fiber,
  selector: Selector,
): [StructuralId, StopNode] {
  const uniqueKeys: Array<ReturnType<typeof getUniqueIdentifier>> = [];

  const stopNode =
    traverseFiber(fiber, true, function (node: FineFiber, ...args) {
      uniqueKeys.push(getUniqueIdentifier(node));
      const res = selector?.(node, ...args);
      return res;
    }) ?? null;

  return [uniqueKeys.join(","), stopNode];
}

export default function creatStructuralIdWithHookCallIndex(
  num: number,
  ...rest: Parameters<typeof createStructuralId>
): [StructuralId, StopNode] {
  const [structuralidWithoutHookCall, stopNode] = createStructuralId(...rest);
  return [`${num}\\${structuralidWithoutHookCall}`, stopNode];
}
