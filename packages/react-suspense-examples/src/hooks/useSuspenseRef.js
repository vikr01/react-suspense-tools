import * as React from 'react';
import {useEffect, useRef} from 'react';
import useStructuralId from './useStructuralId';
import useUnmount from 'react-use/lib/useUnmount';

const map = new Map();
const SENTINEL1 = {};

console.log('map', map);

export default function useSuspenseRef(initValue) {
    const suspenseBoundaryRef = useRef(SENTINEL1);
    const ref = useRef(initValue);
    
    const [structuralId, suspenseBoundary] = useStructuralId((node) => {
        const res = node.elementType === React.Suspense;
        return res;
    });

    console.log('boundary', suspenseBoundary);
    console.log('structuralId', structuralId);

    if (suspenseBoundaryRef.current !== suspenseBoundary) {
        suspenseBoundaryRef.current = suspenseBoundary;
        ref.current = getValue(structuralId, suspenseBoundary, ref.current);
    }

    useUnmount(()=>()=>{
        if (map.has(suspenseBoundary)) {
            const boundaryMap = map.get(suspenseBoundary);
            boundaryMap.delete(structuralId);
        }
    }, [structuralId, suspenseBoundary]);

    return ref;
}

function getValue(structuralId, suspenseBoundary, initValue) {
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