import * as React from "react";
import { useRef } from "react";
import type { Fiber } from "its-fine";
import useStructuralId, { type StructuralId } from "use-structural-id";
import usePrevious from "react-use/lib/usePrevious";
import isSuspense from "react-fiber-identifiers/is-suspense";

type BoundaryMap<T> = Map<StructuralId, T>;

let map = new WeakMap<object, BoundaryMap<{ value: unknown }>>();

export default function useSuspenseRef<T>(initValue: T): React.RefObject<T> {
  const [structuralId, suspenseBoundary] = useStructuralId(
    (node: null | Fiber) => {
      return node != null && isSuspense(node);
    },
    [],
  );

  const ref = useRef<{
    obj: React.RefObject<T>;
    structuralId: typeof structuralId;
    suspenseBoundary: typeof suspenseBoundary;
  }>(null);

  const prevStructuralId = usePrevious(structuralId);

  const prevSuspenseBoundary = usePrevious(suspenseBoundary);

  if (suspenseBoundary == null) {
    throw new Error("Suspense boundary not found.");
  }

  if (
    ref.current == null ||
    ref.current.structuralId !== structuralId ||
    ref.current.suspenseBoundary !== suspenseBoundary
  ) {
    const val = ref.current == null ? initValue : ref.current.obj.current;

    ref.current = {
      obj: createKeyListener(structuralId, suspenseBoundary, val),
      structuralId,
      suspenseBoundary,
    };
  }

  // if the structural id or suspense boundary change, migrate the value object over
  if (
    prevStructuralId != null &&
    prevSuspenseBoundary != null &&
    (prevStructuralId !== structuralId ||
      prevSuspenseBoundary !== suspenseBoundary)
  ) {
    let valueObj: { value: T } = { value: initValue };

    const prevBoundaryMap = getOrCreateBoundaryMap(prevSuspenseBoundary);

    if (prevBoundaryMap.has(prevStructuralId)) {
      valueObj = prevBoundaryMap.get(prevStructuralId) as { value: T };
    }

    setValueObj(structuralId, suspenseBoundary, valueObj);
  }

  return ref.current.obj;
}

function getValue<T>(structuralId: StructuralId, suspenseBoundary: Fiber): T {
  const boundaryMap = getOrCreateBoundaryMap(suspenseBoundary);

  return boundaryMap.get(structuralId)?.value as T;
}

// Suspense may have a .alternate fiber node that it switches between. We'll just share the boundary map for both.
function getOrCreateBoundaryMap<T>(
  suspenseBoundary: Fiber,
): BoundaryMap<{ value: T }> {
  if (!map.has(suspenseBoundary)) {
    const alternate = suspenseBoundary.alternate;
    if (alternate != null && map.has(alternate)) {
      const alternateBoundaryMap = map.get(alternate) as BoundaryMap<{
        value: T;
      }>;
      map.set(suspenseBoundary, alternateBoundaryMap);
    } else {
      const boundaryMap = new Map();
      map.set(suspenseBoundary, boundaryMap);
      if (alternate != null) {
        map.set(alternate, boundaryMap);
      }
    }
  }

  // we've inserted the boundary map if it didn't exist, so just cast
  return map.get(suspenseBoundary) as BoundaryMap<{ value: T }>;
}

function setValueObj<T>(
  structuralId: StructuralId,
  suspenseBoundary: Fiber,
  valueObj: { value: T },
) {
  const boundaryMap = getOrCreateBoundaryMap<T>(suspenseBoundary);
  boundaryMap.set(structuralId, valueObj);
}

function setValue<T>(
  structuralId: StructuralId,
  suspenseBoundary: Fiber,
  value: T,
) {
  const boundaryMap = getOrCreateBoundaryMap<T>(
    suspenseBoundary,
  ) as BoundaryMap<T>;

  if (boundaryMap.has(structuralId)) {
    (boundaryMap.get(structuralId) as { value: T }).value = value;
  } else {
    setValueObj(structuralId, suspenseBoundary, { value });
  }
}

function createKeyListener<T>(
  structuralId: StructuralId,
  suspenseBoundary: Fiber,
  initValue: T,
): React.RefObject<T> {
  const boundaryMap = getOrCreateBoundaryMap(suspenseBoundary);

  const refObj = {};

  Object.defineProperty(refObj, "current", {
    enumerable: true,
    configurable: false,
    get: () => getValue<T>(structuralId, suspenseBoundary),
    set: (v) => setValue(structuralId, suspenseBoundary, v),
  });

  const castedRefObj = refObj as React.RefObject<T>;

  if (!boundaryMap.has(structuralId)) {
    castedRefObj.current = initValue;
  }

  return castedRefObj;
}

export function clearSuspenseRefs() {
  map = new WeakMap();
}
