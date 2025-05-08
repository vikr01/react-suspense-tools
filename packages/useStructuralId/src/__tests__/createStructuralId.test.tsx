import { cleanup, render } from "@testing-library/react";
import * as React from "react";
import createStructuralId from "../createStructuralId";
import { clear } from "react-fiber-identifiers/get-unique-identifier";
import type { Fiber } from "../createStructuralId";

Object.defineProperty(global, "__DEV_STRUCTURAL_ID_DEBUG__", {
  value: false,
  writable: true,
  configurable: true,
});

type ChildrenOnlyProps = {
  children: React.ReactNode;
};

describe("createStructuralId", () => {
  let fiber: null | Fiber = null;
  let fiber3: null | Fiber = null;
  afterEach(() => {
    clear();
    cleanup();
    fiber = null;
  });

  function Component0({ children }: ChildrenOnlyProps) {
    fiber =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
        (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.A?.getOwner?.();
    return children;
  }
  const Component1 = ({ children }: ChildrenOnlyProps) => children;
  class Component2 extends React.Component<ChildrenOnlyProps> {
    render() {
      return this.props.children;
    }
  }
  const Component3 = React.forwardRef(function Component3(
    { children }: ChildrenOnlyProps,
    // silence react complaining there was no second parameter

    _ref,
  ) {
    fiber3 =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
      (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.A?.getOwner?.();

    return children;
  });
  const Component4 = React.Fragment;
  const Component5 = React.memo(({ children }: ChildrenOnlyProps) => children);
  const Component6 = ({ children }: ChildrenOnlyProps) => <a>{children}</a>;
  const Component7 = React.Fragment;

  it("genereates a string from elements with various element types", async () => {
    const components = [
      Component0,
      Component1,
      Component2,
      Component3,
      Component4,
      Component5,
      Component6,
      Component7,
    ] as const;

    const renderNode = components.reduce(
      (node: React.ReactNode, Component) => <Component>{node}</Component>,
      <div data-testid="leaf" />,
    );

    render(renderNode);

    expect(fiber).not.toBeNull();
    const [id] = createStructuralId(151, fiber as Fiber, null);

    expect(id).toMatchSnapshot();
  });

  it("properly reuses ids of component pointers", () => {
    const components = [
      [Component0, null],
      [Component2, "foobar"],
      [Component3, "bazfoo"],
      [Component4, 10],
      [Component7, 15],
    ] as const;

    const renderNode = components.reduce(
      (node: React.ReactNode, [Component, key]) => (
        <Component key={key}>{node}</Component>
      ),
      <div data-testid="leaf2" />,
    );

    render(renderNode);

    expect(fiber).not.toBeNull();

    const structuralNodes = createStructuralId(
      505,
      fiber as Fiber,
      (node: Fiber) => node.elementType === Component3,
    )[0]
      .split("\\")[1]
      .split(",");

    const component3UniqueId =
      structuralNodes[structuralNodes.length - 1].split(":")[0];

    const key = "xyz";
    render(<Component3 children={null} key={key} />);

    const component3AsElementUniqueId = createStructuralId(
      505,
      fiber3 as Fiber,
      null,
    )[0]
      .split("\\")[1]
      .split(",")[0];

    expect(component3AsElementUniqueId).toBe(`${component3UniqueId}:s[${key}]`);
  });

  it("makes readable ids when the flag is on", () => {
    Object.defineProperty(global, "__DEV_STRUCTURAL_ID_DEBUG__", {
      value: true,
      writable: true,
      configurable: true,
    });

    const components = [
      [Component0, null],
      [Component1, 39],
      [Component2, null],
      [Component3, null],
      [Component4, "foobar"],
      [Component5, null],
      [Component6, null],
      [Component7, null],
    ] as const;

    const renderNode = components.reduce(
      (node: React.ReactNode, [Component, key]) => (
        <Component key={key}>{node}</Component>
      ),
      <div data-testid="leaf3" />,
    );

    render(renderNode);

    expect(fiber).not.toBeNull();

    const [id] = createStructuralId(22, fiber as Fiber, null);

    expect(id).toMatchSnapshot();
  });

  it("gets the appropriate stop node", () => {
    const comp5Key = 10;
    const components = [
      [Component0, null],
      [Component7, 15],
      [Component3, "bazfoo"],
      [Component5, comp5Key],
      [Component2, "foobar"],
    ] as const;

    const renderNode = components.reduce(
      (node: React.ReactNode, [Component, key]) => (
        <Component key={key}>{node}</Component>
      ),
      <div data-testid="leaf2" />,
    );

    render(renderNode);

    expect(fiber).not.toBeNull();
    const res = createStructuralId(
      10,
      fiber as Fiber,
      (node: Fiber) => node.elementType === Component5,
    );

    const [, stopNode] = res;

    expect(stopNode?.elementType).toBe(Component5);

    expect(Number(stopNode?.key)).toBe(comp5Key);
  });
});
