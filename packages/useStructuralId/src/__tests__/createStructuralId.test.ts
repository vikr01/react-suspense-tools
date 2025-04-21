import * as React from 'react';
import {createArrayId, clear} from '../createStructuralId';

Object.defineProperty(global, '__DEV_STRUCTURAL_ID_DEBUG__', {
    value: false,
    writable: true,
    configurable: true,
});

describe('createStructuralId', ()=>{
    afterEach(()=>{
        clear();
    });
    
    function Component1() {return null};
    const Component2 = ()=>null;
    class Component3 extends React.Component {
        render() {
            return null;
        }
    }
    const Component4 = React.forwardRef(function Component4() {return null;});
    const Component5 = null;
    const Component6 = React.memo(()=>null);
    const Component7 = 'a' as const;
    const Component8 = null;

    it('genereates a string from elements with various element types', ()=>{
        const components = [
            Component1,
            Component2,
            Component3,
            Component4,
            Component5,
            Component6,
            Component7,
            Component8,
        ];

        const values = declareElementsArray(components.map((comp)=>[comp, 0]));

        const id = createArrayId(values);
        expect(id).toMatchInlineSnapshot(`"000000:n[0],000001:n[0],000002:n[0],000003:n[0],Unknown:n[0],000004:n[0],a:n[0],Unknown:n[0]"`);
    });

    it('properly reuses ids of component pointers', ()=>{
        const components = declareElementsArray([
            [Component2, 'foobar'],
            [Component3, 'bazfoo'],
            [Component4, 10],
            [Component7, 15],
        ]);

        const [component3uniqueId] = createArrayId(components).split(',')[1].split(':');

        expect(createArrayId([[Component3, 'xyz']])).toBe(`${component3uniqueId}:s[xyz]`);
    });

    it('makes readable ids when the flag is on', ()=>{
        Object.defineProperty(global, '__DEV_STRUCTURAL_ID_DEBUG__', {
            value: true,
            writable: true,
            configurable: true,
        });

        const components = declareElementsArray([
            [Component8, 503],
            [Component4, 'baz'],
            [Component6, 11555],
            [Component1, 'null'],
        ]);

        const id = createArrayId(components);
        
        expect(id).toMatchInlineSnapshot(`"Unknown:n[503],Fallback:s[baz],Fallback:n[11555],Component1:s[null]"`);
    });
});

function declareElementsArray<T extends Parameters<typeof createArrayId>[0]>(value: T): T {
    return value;
}