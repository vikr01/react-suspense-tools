/*
forking React@19's implementation to check if a promise is completed synchronously, but using a WeakMap instead
https://github.com/facebook/react/blob/v19.0.0/packages/shared/ReactTypes.js#L106-L132
*/

const PROMISE_MAP = new WeakMap<
  PromiseSync<unknown>,
  StatusedResult<unknown>
>();

enum PromiseStatus {
  fulfilled,
  pending,
  rejected,
}

interface PendingResult {
  status: PromiseStatus.pending;
}

interface FulfilledResult<T> {
  status: PromiseStatus.fulfilled;
  value: T;
}

interface RejectedResult {
  status: PromiseStatus.rejected;
  reason: unknown;
}

type StatusedResult<T> = PendingResult | FulfilledResult<T> | RejectedResult;

interface PendingPromise<T> extends Promise<T> {
  readonly ______isPending___do_not_use: unique symbol;
}

interface FulfilledPromise<T> extends Promise<T> {
  readonly ______isFulfilled___do_not_use: unique symbol;
}

interface RejectedPromise<T> extends Promise<T> {
  readonly ______isRejected___do_not_use: unique symbol;
}

type PromiseSync<T> =
  | PendingPromise<T>
  | FulfilledPromise<T>
  | RejectedPromise<T>;

export default function mapPromise<T>(promise: Promise<T>): PromiseSync<T> {
  const modifiedPromise = promise as PromiseSync<T>;
  PROMISE_MAP.set(modifiedPromise, { status: PromiseStatus.pending });

  modifiedPromise.then((data) => {
    PROMISE_MAP.set(modifiedPromise, {
      status: PromiseStatus.fulfilled,
      value: data,
    });
    return data;
  });

  modifiedPromise.catch((err) => {
    PROMISE_MAP.set(modifiedPromise, {
      status: PromiseStatus.rejected,
      reason: err,
    });
  });

  return modifiedPromise;
}

export function isDone<T>(
  promise: PromiseSync<T>,
): promise is FulfilledPromise<T> {
  const { status } = PROMISE_MAP.get(promise) as StatusedResult<T>;

  if (status !== PromiseStatus.fulfilled) {
    return false;
  }
  return true;
}

export function getValue<T>(promise: FulfilledPromise<T>): T {
  const { value } = PROMISE_MAP.get(promise) as FulfilledResult<T>;

  return value;
}

export function isPending<T>(
  promise: PromiseSync<T>,
): promise is PendingPromise<T> {
  const { status } = PROMISE_MAP.get(promise) as StatusedResult<T>;

  if (status !== PromiseStatus.pending) {
    return false;
  }
  return true;
}

export function isRejected<T>(
  promise: PromiseSync<T>,
): promise is RejectedPromise<T> {
  const { status } = PROMISE_MAP.get(promise) as StatusedResult<T>;

  if (status !== PromiseStatus.rejected) {
    return false;
  }
  return true;
}

export function getReason<T>(promise: RejectedPromise<T>): unknown {
  const { reason } = PROMISE_MAP.get(promise) as RejectedResult;

  return reason;
}
