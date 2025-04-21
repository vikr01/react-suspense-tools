import * as React from 'react';
import {createArrayId} from '../createStructuralId';

type Index = number;

Object.defineProperty(global, '__DEV_STRUCTURAL_ID_DEBUG__', {
    value: true, // or false
    writable: true,
    configurable: true,
});

describe('createStructuralId', ()=>{
    it('genereates a string from elements with various element types', ()=>{
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
        const Component7: 'a' = 'a';
        const Component8 = null;


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


        const values: Parameters<typeof createArrayId>[0] = components.map((comp)=>[comp, 0]);

        const id = createArrayId(values);
        expect(id).toMatchInlineSnapshot(`"Component1:n:0,Component2:n:0,Component3:n:0,Fallback:n:0,Unknown:n:0,Fallback:n:0,a:n:0,Unknown:n:0"`);
    });
});
