import { useCallback } from "react";
import useForceUpdate from "use-force-update";
import useSuspenseRef from "use-suspense-ref";

const SENTINEL: unique symbol = Symbol();

type Result<T> = {
  promise: PromiseLike<T>;
  reset: () => void;
};

export default function useSuspendable<T>(cb: () => PromiseLike<T>): Result<T> {
  const forceUpdate = useForceUpdate();

  const suspenseRef = useSuspenseRef<typeof SENTINEL | PromiseLike<T>>(
    SENTINEL,
  );
  if (suspenseRef.current == SENTINEL) {
    suspenseRef.current = cb();
  }

  const reset = useCallback(() => {
    suspenseRef.current = cb();
    forceUpdate();
  }, [cb, forceUpdate]);

  return {
    promise: suspenseRef.current,
    reset,
  };
}
