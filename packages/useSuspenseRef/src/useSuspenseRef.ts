import * as React from 'react';
import {useRef} from 'react';
import type {Fiber} from 'its-fine';
import useStructuralId, {type StructuralId} from 'use-structural-id';
import useUnmount from 'react-use/lib/useUnmount';

const map = new WeakMap();
const SENTINEL1 = {};

console.log('map', map);

export default function useSuspenseRef<T>(initValue: T): React.RefObject<T> {
    const suspenseBoundaryRef = useRef<typeof SENTINEL1 | Fiber>(SENTINEL1);
    const ref = useRef<null | React.RefObject<T>>(null);
    
    const [structuralId, suspenseBoundary] = useStructuralId((node: Fiber<any>) => {
        const res = node.elementType === React.Suspense;
        return res;
    }, []);

    if (suspenseBoundaryRef.current !== suspenseBoundary) {
        if (suspenseBoundary == null) {
            throw new Error('Suspense boundary not found.');
        }
        suspenseBoundaryRef.current = suspenseBoundary;
    }

    if (ref.current == null) {
        ref.current = createKeyListener(structuralId, suspenseBoundary, initValue);
    }

    useUnmount(()=>()=>{
        if (map.has(suspenseBoundary)) {
            const boundaryMap = map.get(suspenseBoundary);
            boundaryMap.delete(structuralId);
        }
    }, 
    // [structuralId, suspenseBoundary]
    );

    console.log('here\'s obj', ref.current);

    return ref.current;
}

function getValue<T>(structuralId: StructuralId, suspenseBoundary: Fiber, initValue: T) {
    if (!map.has(suspenseBoundary)) {
        map.set(suspenseBoundary, new Map());
    }

    const boundaryMap = map.get(suspenseBoundary);

    if (!boundaryMap.has(structuralId)) {
        console.log('setting value', structuralId, initValue);
        boundaryMap.set(structuralId, initValue);
        console.log('boundaryMap', boundaryMap);
    }

    return boundaryMap.get(structuralId);
}

function setValue<T>(structuralId: StructuralId, suspenseBoundary: Fiber, value: T) {
    if (!map.has(suspenseBoundary)) {
        map.set(suspenseBoundary, new Map());
    }

    const boundaryMap = map.get(suspenseBoundary);
    boundaryMap.set(structuralId, value);
}


function createKeyListener<T>(structuralId: StructuralId, suspenseBoundary: Fiber, initValue: T): React.RefObject<T> {
    const o = {};

    const val = getValue(structuralId, suspenseBoundary, initValue);

    Object.defineProperty(o, 'current', {
        enumerable: true,
        configurable: false,
        get() {
            return val;
        },
        set(v) { 
            setValue(structuralId, suspenseBoundary, v);
        },
    });

    return (o as React.RefObject<T>);
}
