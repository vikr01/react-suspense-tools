import { nanoid } from 'nanoid/non-secure';

type ElementType = string | object | Function;
type Key = string | number;

declare const __DEV_STRUCTURAL_ID_DEBUG__: boolean;

const objectHashes = new WeakMap<object, string>();

function getElementTypeId(elementType: ElementType): string {
  if (elementType == null) { return 'Unknown'; }
  if (typeof elementType !== 'object' && typeof elementType !== 'function') return elementType.toString();

  if (!objectHashes.has(elementType)) {
    let id: string;

    // This will get stripped out in prod as dead code
    if (process.env.NODE_ENV === 'development' && __DEV_STRUCTURAL_ID_DEBUG__) {
      id = (elementType as any)?.displayName ?? (elementType as any).name ?? elementType.toString();
    } else {
      id = nanoid(6);
    }

    objectHashes.set(elementType, id);
  }

  return objectHashes.get(elementType)!;
}

export function createArrayId(
  arr: ReadonlyArray<[ElementType, Key]>
): string {
  const parts: string[] = [];

  for (let i = 0; i < arr.length; i++) {
    const [elementType, key] = arr[i];
    const elementTypeId = getElementTypeId(elementType);
    const encodedKey =
      typeof key === 'string' ? `s:${key}` : `n:${key}`;
    parts.push(`${elementTypeId}:${encodedKey}`);
  }

  return parts.join(',');
}

export function createArrayIdWithNumber(
  num: number,
  arr: ReadonlyArray<[ElementType, Key]>
): string {
  return `${num}:${createArrayId(arr)}`;
}
