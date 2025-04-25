import { nanoid } from "nanoid/non-secure";
import type { Fiber } from "react-reconciler";
import type { ComponentType, JSX } from "react";

export type ElementType = ComponentType | keyof JSX.IntrinsicElements | null;
export type Key = NonNullable<Fiber["key"]> | Fiber["index"];
export type FiberUniqueKey = string;
type ElementUniqueKey = string;

export default function getUniqueIdentifier(fiber: Fiber): FiberUniqueKey {
  const elementType: ElementType = fiber.elementType;
  const elementTypeId = getElementTypeId(elementType);

  const key: Key = fiber.key ?? fiber.index;
  const encodedKey =
    typeof key === "string" ? `s[${key}]` : `n[${key.toString()}]`;

  return `${elementTypeId}:${encodedKey}`;
}

declare const __DEV_STRUCTURAL_ID_DEBUG__: boolean;

let objectHashes = new WeakMap<object, ElementUniqueKey>();

function getElementTypeId(elementType: ElementType): ElementUniqueKey {
  if (elementType == null) {
    return "Unknown";
  }
  if (typeof elementType !== "object" && typeof elementType !== "function")
    return elementType.toString();

  if (!objectHashes.has(elementType)) {
    let id: string;

    // This will get stripped out in prod as dead code
    if (process.env.NODE_ENV === "development" && __DEV_STRUCTURAL_ID_DEBUG__) {
      id =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (elementType as any)?.displayName ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (elementType as any).name ??
        "Fallback";
    } else {
      id = nanoid(6);
    }

    objectHashes.set(elementType, id);
  }

  return objectHashes.get(elementType)!;
}

export function clear() {
  objectHashes = new WeakMap();
}
