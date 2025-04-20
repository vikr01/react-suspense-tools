import * as React from 'react';
import { useImperativeHandle } from 'react';
import createUseHookCallIndex from "../createUseHookCallIndex";
import {render} from '@testing-library/react'

type HookResultsRef = React.RefObject<null | ReadonlyArray<number>>;

type TestingComponent = (props: {hookResultsRef?: HookResultsRef}) => null;

describe('createUseHookCallIndex', ()=>{
  it('will properly increment numbers across a single component and maintain across rerenders', () => {
    const useHookCallIndex = createUseHookCallIndex();
    const Component: TestingComponent & jest.Mock  = jest.fn(({hookResultsRef})=>{
      const results = Array.from({ length: 3 }).map(useHookCallIndex);

      useImperativeHandle(hookResultsRef, ()=>results);
      
      return null;
    });

    const hookResultsRef: HookResultsRef = {current: null};

    const {rerender} = render(<Component hookResultsRef={hookResultsRef}/>);

    expect(Component).toHaveBeenCalledTimes(1);
    Component.mockClear();

    expect(hookResultsRef.current).toEqual([0,1,2]);

    // rerendering

    rerender(<Component hookResultsRef={hookResultsRef}/>);

    expect(Component).toHaveBeenCalledTimes(1);
    Component.mockClear();

    expect(hookResultsRef.current).toEqual([0,1,2]);
  });

  it('will not affect the values of another component using the same hook', () => {
    const useHookCallIndex = createUseHookCallIndex();
    const Component1: TestingComponent  = ({hookResultsRef})=>{
      const results = Array.from({ length: 3 }).map(useHookCallIndex);

      useImperativeHandle(hookResultsRef, ()=>results);
      
      return null;
    }

    const Component2: TestingComponent = ({hookResultsRef})=>{
      const results = Array.from({ length: 3 }).map(useHookCallIndex);

      useImperativeHandle(hookResultsRef, ()=>results);
      
      return null;
    }

    const hookResultsRef: HookResultsRef = {current: null};

    render(<Component1 hookResultsRef={hookResultsRef}/>);

    expect(hookResultsRef.current).toEqual([0,1,2]);

    const hookResultsRef2: HookResultsRef = {current: null};
    render(<Component2 hookResultsRef={hookResultsRef2}/>);

    expect(hookResultsRef2.current).toEqual([0,1,2]);
  });

  it('will not modify the value across remounts', () => {
    const useHookCallIndex = createUseHookCallIndex();
    const Component: TestingComponent & jest.Mock  = jest.fn(({hookResultsRef})=>{
      const results = Array.from({ length: 3 }).map(useHookCallIndex);

      useImperativeHandle(hookResultsRef, ()=>results);
      
      return null;
    })

    const hookResultsRef: HookResultsRef = {current: null};

    let key = 0;

    const {rerender} = render(<Component hookResultsRef={hookResultsRef} key={(key++).toString()}/>);

    rerender(<Component hookResultsRef={hookResultsRef} key={key}/>);

    expect(hookResultsRef.current).toEqual([0,1,2]);
  });

  it('can maintain multiple increments within the same component', ()=>{
    const useHookCallIndex1 = createUseHookCallIndex();
    const useHookCallIndex2 = createUseHookCallIndex();

    const Component = ({hookResultsRef1, hookResultsRef2}: {hookResultsRef1: HookResultsRef, hookResultsRef2: HookResultsRef}) => {
      const results1 = Array.from({ length: 3 }).map(useHookCallIndex1);
      const results2 = Array.from({ length: 4 }).map(useHookCallIndex2);

      useImperativeHandle(hookResultsRef1, ()=>results1);
      useImperativeHandle(hookResultsRef2, ()=>results2);

      return null;
    }

    const hookResultsRef1 = createRef();
    const hookResultsRef2 = createRef();

    render(<Component hookResultsRef1={hookResultsRef1} hookResultsRef2={hookResultsRef2}/>);

    expect(hookResultsRef1.current).toEqual([0,1,2]);
    expect(hookResultsRef2.current).toEqual([0,1,2,3]);
  });
});

function createRef(): HookResultsRef {
  return {
    current: null,
  };
}


