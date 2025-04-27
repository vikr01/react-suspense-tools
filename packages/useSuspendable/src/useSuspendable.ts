import useSuspenseRef from "use-suspense-ref";
import buildUseStable from "react-use-stable/builder";

const useStable = buildUseStable(useSuspenseRef);

export default function useSuspendable<T>(
  cb: () => PromiseLike<T>,
  dependencies: ReadonlyArray<unknown>,
): PromiseLike<T> {
  return useStable(cb, dependencies);
}
