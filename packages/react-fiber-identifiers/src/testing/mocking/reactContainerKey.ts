export type ReactContainerKey =
  "_reactContainer$... - random key here, this is just for typescript to properly catch the type";

// See here for how react generates this: https://github.com/facebook/react/blob/bc6184dd993e6ea0efdee7553293676db774c3ca/packages/react-dom-bindings/src/client/ReactDOMComponentTree.js#L40
// @ts-expect-error We're forcing the type to _reactFiber since the rest of the string is generated at runtime
const reactContainerKey: ReactContainerKey = `__reactContainer$${Math.random().toString(36).slice(2)}`;

export default reactContainerKey;
