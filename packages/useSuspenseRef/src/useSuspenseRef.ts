import * as React from "react";
import { useEffect, useRef } from "react";
import type { Fiber } from "its-fine";
import useStructuralId, { type StructuralId } from "use-structural-id";
import usePrevious from "react-use/lib/usePrevious";

let map = new WeakMap();

export default function useSuspenseRef<T>(initValue: T): React.RefObject<T> {
  const ref = useRef<null | React.RefObject<T>>(null);
  const prevValueRef = useRef<T>(initValue);

  const [structuralId, suspenseBoundary] = useStructuralId((node: Fiber) => {
    const res = node.elementType === React.Suspense;
    return res;
  }, []);

  const structuralIdRef = useRef(structuralId);
  structuralIdRef.current = structuralId;
  const suspenseBoundaryRef = useRef<null | Fiber>(suspenseBoundary);

  const prevStructuralId = usePrevious(structuralId);

  const prevSuspenseBoundary = usePrevious(suspenseBoundary);

  if (ref.current == null) {
    ref.current = createKeyListener(
      structuralIdRef,
      suspenseBoundaryRef,
      initValue,
    );
  }

  useEffect(() => {
    if (ref.current != null) {
      prevValueRef.current = ref.current.current;
    }
  });

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

  return ref.current;
}

function getValue<T>(
  structuralIdRef: React.RefObject<StructuralId>,
  suspenseBoundaryRef: React.RefObject<null | Fiber>,
): T | undefined {
  const suspenseBoundary = suspenseBoundaryRef.current;
  const structuralId = structuralIdRef.current;

  if (suspenseBoundary == null) {
    return undefined;
  }

  const boundaryMap = map.get(suspenseBoundaryRef);

  return boundaryMap.get(structuralId);
}

function setValue<T>(
  structuralIdRef: React.RefObject<StructuralId>,
  suspenseBoundaryRef: React.RefObject<null | Fiber>,
  value: T,
) {
  const suspenseBoundary = suspenseBoundaryRef.current;
  const structuralId = structuralIdRef.current;

  if (suspenseBoundary == null) {
    return;
  }

  if (!map.has(suspenseBoundary)) {
    map.set(suspenseBoundary, new Map());
  }

  const boundaryMap = map.get(suspenseBoundary);
  boundaryMap.set(structuralId, value);
}

function createKeyListener<T>(
  structuralIdRef: React.RefObject<StructuralId>,
  suspenseBoundaryRef: React.RefObject<null | Fiber>,
  initValue: T,
): React.RefObject<T> {
  const o = {};

  Object.defineProperty(o, "current", {
    enumerable: true,
    configurable: false,
    get() {
      return getValue<T>(structuralIdRef, suspenseBoundaryRef);
    },
    set(v) {
      setValue(structuralIdRef, suspenseBoundaryRef, v);
    },
  });

  setValue(structuralIdRef, suspenseBoundaryRef, initValue);

  return o as React.RefObject<T>;
}

export function clearSuspenseRefs() {
  map = new WeakMap();
}
