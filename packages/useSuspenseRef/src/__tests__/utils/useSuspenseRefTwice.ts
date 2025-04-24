import useSuspenseRef from "../../useSuspenseRef";

export default function useSuspenseRefTwice<T, V>(
  init1: T,
  init2: V,
): [
  ReturnType<typeof useSuspenseRef<T>>,
  ReturnType<typeof useSuspenseRef<V>>,
] {
  const res1 = useSuspenseRef<T>(init1);
  const res2 = useSuspenseRef<V>(init2);

  return [res1, res2];
}
