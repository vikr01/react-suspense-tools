// This is to mock the reactFiberKey that React makes so we can know what it is. We need to do this before anything react is imported.
jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

import * as React from 'react';
import { renderHook } from "@testing-library/react";
import useStructuralId, { type Fiber } from "../useStructuralId";

type Props = {
    children: React.ReactNode,
};

type TestComponent = React.FunctionComponent<Props>;

type ComponentMap = {
    [key: string]: TestComponent,
};

type ReactFiberKey = '_reactFiber$... - random key here, this is just for typescript to properly catch the type';

type ReactFiberHTMLElement = HTMLElement & {[key in ReactFiberKey]: Fiber};

// See here for how react generates this: https://github.com/facebook/react/blob/bc6184dd993e6ea0efdee7553293676db774c3ca/packages/react-dom-bindings/src/client/ReactDOMComponentTree.js#L40
// @ts-expect-error We're forcing the type to _reactFiber since the rest of the string is generated at runtime
const reactFiberKey: ReactFiberKey = `__reactFiber$${Math.random().toString(36).slice(2)}`;

function assertNonNull<T>(x: T): asserts x is NonNullable<T> {
    expect(x).not.toBeNull();
}

describe('useStructuralId', () => {
    let TreeComponent: TestComponent;
    let components: ComponentMap;

    beforeAll(()=>{
        [TreeComponent, components] = generateTree(5);
    });

    afterAll(()=>{
        jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should return a structural id', () => {
        const {result} = renderHook(()=>useStructuralId(null, []), {wrapper: TreeComponent});

        const [structuralId, stopNode] = result.current;

        expect(structuralId).toMatchInlineSnapshot(`"0:TestComponent:n[0],Component5:n[0],Component4:n[0],Component3:n[0],Component2:n[0],Component1:n[0],Unknown:n[0]"`);

        expect(stopNode).toBeNull();
    });

    it('should find the right fiber node', () => {
        const {result} = renderHook(
            ()=>useStructuralId((node: Fiber)=>node.elementType === components.Component3, []),
            {wrapper: TreeComponent}
        );

        const [structuralId, stopNode] = result.current;

        expect(structuralId).toMatchInlineSnapshot(`"0:TestComponent:n[0],Component5:n[0],Component4:n[0],Component3:n[0]"`);

        expect(stopNode?.elementType).toBe(components.Component3);
    });

    it('should work with html tags', ()=>{
        const OldComponent3 = components.Component3;

        const htmlNodeRef: React.RefObject<ReactFiberHTMLElement | null> = {
            current: null,
        };

        const DivComponent = jest.fn(({children}: Props)=>{
            return (
                <span data-testid="FakeComponent3" ref={htmlNodeRef}>
                    <OldComponent3>
                        {children}
                    </OldComponent3>
                </span>
            );
        });

        components.Component3 = DivComponent;

        const {result} = renderHook(
            ()=>useStructuralId((node: Fiber)=>node.elementType === 'span', []),
            {wrapper: TreeComponent}
        );

        expect(DivComponent).toHaveBeenCalledTimes(1);

        const [structuralId, stopNode] = result.current;

        expect(structuralId.split(',')).toHaveLength(5);

        assertNonNull(htmlNodeRef.current);

        expect(stopNode).toBe(htmlNodeRef.current[reactFiberKey]);

        components.Component3 = OldComponent3;
    });

});

function generateTree(count: number): [TestComponent, ComponentMap] {
    const firstComponentName = `Component${count}`;

    let PrevComponent: TestComponent = ({
        [firstComponentName]({children}: Props) {
            return children;
        }
    })[firstComponentName];

    const components: ComponentMap = {
        [firstComponentName]: PrevComponent,
    };
  
    for (let i = count-1; i >= 1; i--) {
        const name = `Component${i}`;
        
        const Comp: TestComponent = ({
            [name]({children, ...props}: Props) {
                const InnerComponent = components[`Component${i+1}`];

                return (
                    <InnerComponent {...props}>
                        {children}
                    </InnerComponent>
                );
            }
        })[name];

        components[name] = Comp;
        PrevComponent = Comp;
    }

  
    return [PrevComponent, components];
}
