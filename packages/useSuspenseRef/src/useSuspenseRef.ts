import * as React from 'react';
import {useRef} from 'react';
import type {Fiber} from 'its-fine';
import useStructuralId, {type StructuralId} from 'use-structural-id';
import useUnmount from 'react-use/lib/useUnmount';

const map = new Map();
const SENTINEL1 = {};

console.log('map', map);

export default function useSuspenseRef<T>(initValue: T) {
    const suspenseBoundaryRef = useRef<typeof SENTINEL1 | Fiber>(SENTINEL1);
    const ref = useRef(initValue);
    
    const [structuralId, suspenseBoundary] = useStructuralId((node: Fiber<any>) => {
        const res = node.elementType === React.Suspense;
        return res;
    });

    console.log('boundary', suspenseBoundary);
    console.log('structuralId', structuralId);

    if (suspenseBoundaryRef.current !== suspenseBoundary) {
        if (suspenseBoundary == null) {
            throw new Error('Suspense boundary not found.');
        }
        suspenseBoundaryRef.current = suspenseBoundary;
        ref.current = getValue(structuralId, suspenseBoundary, ref.current);
    }

    useUnmount(()=>()=>{
        if (map.has(suspenseBoundary)) {
            const boundaryMap = map.get(suspenseBoundary);
            boundaryMap.delete(structuralId);
        }
    }, 
    // [structuralId, suspenseBoundary]
    );

    return ref;
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
