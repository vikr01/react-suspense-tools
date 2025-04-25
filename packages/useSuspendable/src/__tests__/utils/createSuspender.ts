import type { Unsuspend } from "./types";
type Resolve<T> = null | ((p0: T) => unknown);

export default function createSuspender<T>(): [Promise<T>, Unsuspend<T>] {
  let resolve: Resolve<T> = null;

  const promise = new Promise<T>((_resolve) => {
    resolve = _resolve;
    return;
  });

  const unsuspend = async (p0: T) => {
    resolve?.(p0);
    await promise;
  };

  return [promise, unsuspend];
}
