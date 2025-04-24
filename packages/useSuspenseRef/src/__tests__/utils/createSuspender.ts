import type { Unsuspend } from "./types";
type Resolve = null | ((...args: unknown[]) => unknown);

export default function createSuspender(): [Promise<void>, Unsuspend] {
  let resolve: Resolve = null;

  const promise = new Promise((_resolve) => {
    resolve = _resolve;
    return;
  }).then(() => {});

  const unsuspend = async () => {
    resolve?.();
    await promise;
  };

  return [promise, unsuspend];
}
