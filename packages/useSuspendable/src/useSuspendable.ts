import useSuspenseRef from "use-suspense-ref";
import buildUseStable from "react-use-stable/builder";

const useStable = buildUseStable(useSuspenseRef);

export default function useSuspendable<T, Y extends Promise<T> = Promise<T>>(
  cb: () => Y,
  dependencies: ReadonlyArray<unknown>,
): [Y] {
  return [useStable(cb, dependencies)];
}
