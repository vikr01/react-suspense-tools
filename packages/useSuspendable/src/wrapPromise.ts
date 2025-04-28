/*
forking React@19's implementation to check if a promise is completed synchronously
https://github.com/facebook/react/blob/v19.0.0/packages/shared/ReactTypes.js#L106-L132
*/

enum PromiseStatus {
  fulfilled,
  pending,
  rejected,
}

interface PendingThenable<T> extends Promise<T> {
  status: PromiseStatus.pending;
}

interface FulfilledThenable<T> extends Promise<T> {
  status: PromiseStatus.fulfilled;
  value: T;
}

interface RejectedThenable<T> extends Promise<T> {
  status: PromiseStatus.rejected;
  reason: unknown;
}

type StatusedThenable<T> =
  | PendingThenable<T>
  | FulfilledThenable<T>
  | RejectedThenable<T>;

type PromiseSync<T> = Promise<T> & StatusedThenable<T>;

export default function wrapPromise<T>(promise: Promise<T>): PromiseSync<T> {
  const modifiedPromise = promise as unknown as PendingThenable<T>;
  modifiedPromise.status = PromiseStatus.pending;

  modifiedPromise.then((data) => {
    const fulfilledPromise = modifiedPromise as unknown as FulfilledThenable<T>;
    fulfilledPromise.status = PromiseStatus.fulfilled;
    fulfilledPromise.value = data;
    return data;
  });

  modifiedPromise.catch((err) => {
    const erroredPromise = modifiedPromise as unknown as RejectedThenable<T>;
    erroredPromise.status = PromiseStatus.rejected;
    erroredPromise.reason = err;
  });

  return modifiedPromise;
}

export function isDone<T>(
  promise: PromiseSync<T>,
): promise is FulfilledThenable<T> {
  if (promise.status !== PromiseStatus.fulfilled) {
    return false;
  }
  return true;
}

export function getValue<T>(promise: FulfilledThenable<T>): T {
  return promise.value;
}

export function isPending<T>(
  promise: PromiseSync<T>,
): promise is PendingThenable<T> {
  if (promise.status !== PromiseStatus.pending) {
    return false;
  }
  return true;
}

export function isRejected<T>(
  promise: PromiseSync<T>,
): promise is RejectedThenable<T> {
  if (promise.status !== PromiseStatus.rejected) {
    return false;
  }
  return true;
}

export function getReason<T>(promise: RejectedThenable<T>): unknown {
  return promise.reason;
}
