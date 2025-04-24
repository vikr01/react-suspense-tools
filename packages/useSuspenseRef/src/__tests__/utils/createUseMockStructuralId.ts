import type useStructuralId from "use-structural-id";
import type useSuspenseRef from "../../useSuspenseRef";

function createUseMockStructuralId(
  res: ReturnType<typeof useStructuralId>,
): [typeof useSuspenseRef, jest.Mock] {
  const fakeFn = jest.fn(() => res);
  jest.resetModules();
  jest.doMock("use-structural-id", () => ({
    __esModule: true,
    default: fakeFn,
  }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: _useSuspenseRef } = require("../../useSuspenseRef") as {
    default: typeof useSuspenseRef;
  };

  return [_useSuspenseRef, fakeFn];
}

export default createUseMockStructuralId;
