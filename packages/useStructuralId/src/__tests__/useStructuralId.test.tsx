import * as React from 'react';
import { renderHook, type RenderResult } from "@testing-library/react";
import useStructuralId, { type Fiber, type Selector } from "../useStructuralId";

type Props = {
    children: React.ReactNode,
};

type TestComponent = React.FunctionComponent<Props>;

type ComponentMap = {
    [key: string]: TestComponent,
};

describe('useStructuralId', () => {
    let TreeComponent: TestComponent;
    let components: ComponentMap;

    beforeAll(()=>{
        [TreeComponent, components] = generateTree(5);
    })

    it('should return a structural id', () => {
        const {result} = renderHook(()=>useStructuralId(null, []), {wrapper: TreeComponent});

        const [structuralId, stopNode] = result.current;

        expect(structuralId).toMatchSnapshot();

        expect(stopNode).toBeNull();
    });

    it('should find the right fiber node', () => {
        const {result} = renderHook(
            ()=>useStructuralId((node: Fiber)=>node.elementType === components.Component3, []),
            {wrapper: TreeComponent}
        );

        const [structuralId, stopNode] = result.current;

        expect(structuralId).toMatchSnapshot();

        expect(stopNode?.elementType).toBe(components.Component3);
    });

    it('should work with html tags', ()=>{
        const OldComponent3 = components.Component3;
        const htmlNodeRef: React.RefObject<HTMLDivElement | null> = {
            current: null,
        };

        const DivComponent = ({children}: Props)=>(
            <div data-testid="FakeComponent3" ref={htmlNodeRef}>
                <OldComponent3>
                    {children}
                </OldComponent3>
            </div>
        );
        components.Component3 = DivComponent;

        const {result} = renderHook(
            ()=>useStructuralId((node: Fiber)=>node.elementType === 'div', []),
            {wrapper: TreeComponent}
        );

        const [structuralId, stopNode] = result.current;

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

        const InnerComponent = components[`Component${i+1}`];
        
        const Comp: TestComponent = ({
            [name]({children, ...props}: Props) {
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
