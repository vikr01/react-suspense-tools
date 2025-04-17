import { nanoid } from 'nanoid/non-secure';
import type { Fiber } from 'its-fine'; // or wherever you're importing from

// ------------------------
// Pointer-to-ID: Fiber → NanoID
// ------------------------

const fiberHashes = new WeakMap<Fiber, string>();

function getFiberHash(fiber: Fiber): string {
  if (!fiberHashes.has(fiber)) {
    fiberHashes.set(fiber, nanoid(6)); // short + unique per fiber instance
  }
  return fiberHashes.get(fiber)!;
}

// ------------------------
// createArrayId
// ------------------------

export function createArrayId(
  arr: ReadonlyArray<[Fiber, string | number]>
): string {
  const parts: string[] = [];

  for (let i = 0; i < arr.length; i++) {
    const [fiber, key] = arr[i];
    const fiberId = getFiberHash(fiber);
    const encodedKey =
      typeof key === 'string' ? `s:${key}` : `n:${key}`;
    parts.push(`${fiberId}:${encodedKey}`);
  }

  return parts.join(',');
}

// ------------------------
// createArrayIdWithNumber
// ------------------------

export function createArrayIdWithNumber(
  num: number,
  arr: ReadonlyArray<[Fiber, string | number]>
): string {
  return `${num}:${createArrayId(arr)}`;
}
