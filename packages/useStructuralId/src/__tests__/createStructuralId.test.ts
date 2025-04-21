import * as React from "react";
import { createArrayId, clear } from "../createStructuralId";

type ElementsArray = Parameters<typeof createArrayId>[0];

Object.defineProperty(global, "__DEV_STRUCTURAL_ID_DEBUG__", {
  value: false,
  writable: true,
  configurable: true,
});

describe("createStructuralId", () => {
  afterEach(() => {
    clear();
  });

  function Component0() {
    return null;
  }
  const Component1 = () => null;
  class Component2 extends React.Component {
    render() {
      return null;
    }
  }
  const Component3 = React.forwardRef(function Component4() {
    return null;
  });
  const Component4 = null;
  const Component5 = React.memo(() => null);
  const Component6 = "a" as const;
  const Component7 = null;

  it("genereates a string from elements with various element types", () => {
    const components = [
      Component0,
      Component1,
      Component2,
      Component3,
      Component4,
      Component5,
      Component6,
      Component7,
    ];

    const values = components.map((comp) => [comp, 0]) as ElementsArray;

    const id = createArrayId(values);
    expect(id).toMatchSnapshot();
  });

  it("properly reuses ids of component pointers", () => {
    const components = [
      [Component2, "foobar"],
      [Component3, "bazfoo"],
      [Component4, 10],
      [Component7, 15],
    ] as ElementsArray;

    const [component3uniqueId] = createArrayId(components)
      .split(",")[1]
      .split(":");

    expect(createArrayId([[Component3, "xyz"]])).toBe(
      `${component3uniqueId}:s[xyz]`,
    );
  });

  it("makes readable ids when the flag is on", () => {
    Object.defineProperty(global, "__DEV_STRUCTURAL_ID_DEBUG__", {
      value: true,
      writable: true,
      configurable: true,
    });

    const components = [
      [Component7, 503],
      [Component3, "baz"],
      [Component5, 11555],
      [Component0, "null"],
    ] as ElementsArray;

    const id = createArrayId(components);

    expect(id).toMatchSnapshot();
  });
});
