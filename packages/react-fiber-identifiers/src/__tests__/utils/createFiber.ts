jest.spyOn(global.Math, "random").mockReturnValue(0.5);

import type { Fiber } from "react-reconciler";
import ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";

type ReactContainerKey =
  "_reactContainer$... - random key here, this is just for typescript to properly catch the type";

type ReactContainer = HTMLDivElement & {
  [key in ReactContainerKey]: Fiber;
};

// See here for how react generates this: https://github.com/facebook/react/blob/bc6184dd993e6ea0efdee7553293676db774c3ca/packages/react-dom-bindings/src/client/ReactDOMComponentTree.js#L40
// @ts-expect-error We're forcing the type to _reactFiber since the rest of the string is generated at runtime
const reactContainerKey: ReactContainerKey = `__reactContainer$${Math.random().toString(36).slice(2)}`;

export default function createFiber(element: React.ReactElement): Fiber {
  const container = document.createElement("div") as ReactContainer;

  const root = ReactDOM.createRoot(container);

  flushSync(() => {
    root.render(element);
  });

  const containerNode = container[reactContainerKey];

  const fiber = containerNode.alternate?.child as Fiber;

  root.unmount();

  return fiber as Fiber;
}
