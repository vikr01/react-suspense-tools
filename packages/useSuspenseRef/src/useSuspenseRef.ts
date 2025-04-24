import * as React from "react";
import { useEffect, useRef } from "react";
import type { Fiber } from "its-fine";
import useStructuralId, { type StructuralId } from "use-structural-id";
import usePrevious from "react-use/lib/usePrevious";

let map = new WeakMap();
const SENTINEL1 = {};

export default function useSuspenseRef<T>(initValue: T): React.RefObject<T> {
  const suspenseBoundaryRef = useRef<typeof SENTINEL1 | Fiber>(SENTINEL1);
  const [structuralId, suspenseBoundary] = useStructuralId((node: Fiber) => {
    const res = node.elementType === React.Suspense;
    return res;
  }, []);

  const ref = useRef<{
    obj: React.RefObject<T>;
    structuralId: typeof structuralId;
    suspenseBoundary: typeof suspenseBoundary;
  }>(null);

  const prevStructuralId = usePrevious(structuralId);

  const prevSuspenseBoundary = usePrevious(suspenseBoundary);

  if (suspenseBoundaryRef.current !== suspenseBoundary) {
    if (suspenseBoundary == null) {
      throw new Error("Suspense boundary not found.");
    }
    suspenseBoundaryRef.current = suspenseBoundary;
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

  useEffect(() => {
    if (
      prevStructuralId != null &&
      prevSuspenseBoundary != null &&
      (prevStructuralId !== structuralId ||
        prevSuspenseBoundary !== suspenseBoundary)
    ) {
      if (map.has(prevSuspenseBoundary)) {
        const boundaryMap = map.get(prevSuspenseBoundary);
        boundaryMap.delete(prevStructuralId);
      }
    }
  }, [structuralId, suspenseBoundary]);

  return ref.current.obj;
}

function getValue<T>(structuralId: StructuralId, suspenseBoundary: Fiber): T {
  const boundaryMap = map.get(suspenseBoundary);

  return boundaryMap.get(structuralId);
}

function setValue<T>(
  structuralId: StructuralId,
  suspenseBoundary: Fiber,
  value: T,
) {
  if (!map.has(suspenseBoundary)) {
    map.set(suspenseBoundary, new Map());
  }

  const boundaryMap = map.get(suspenseBoundary);
  boundaryMap.set(structuralId, value);
}

function createKeyListener<T>(
  structuralId: StructuralId,
  suspenseBoundary: Fiber,
  initValue: T,
): React.RefObject<T> {
  const o = {};

  Object.defineProperty(o, "current", {
    enumerable: true,
    configurable: false,
    get() {
      return getValue<T>(structuralId, suspenseBoundary);
    },
    set(v) {
      setValue(structuralId, suspenseBoundary, v);
    },
  });

  setValue(structuralId, suspenseBoundary, initValue);

  return o as React.RefObject<T>;
}

export function clearSuspenseRefs() {
  map = new WeakMap();
}
