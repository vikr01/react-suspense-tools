import type { Fiber } from "react-reconciler";
import "./mocking/mockRandom";
import ReactDOM from "react-dom/client";
import reactContainerKey from "./mocking/reactContainerKey";
import "./mocking/unmockRandom";
import { flushSync } from "react-dom";

type ReactContainer = HTMLDivElement & {
  [key in typeof reactContainerKey]: Fiber;
};

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
