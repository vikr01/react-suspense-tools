import {useFiber, traverseFiber, Fiber} from 'its-fine';
import {useRef} from 'react';

type Selector = Parameters<typeof traverseFiber>[2];
export type StructuralId = string;
type StopNode = Fiber | null;

export default function useStructuralId(selector: Selector, dependencies: ReadonlyArray<unknown>): [StructuralId, StopNode] {
    const stopNodeRef = useRef<StopNode>(null);
    const structuralIdRef = useRef<StructuralId>(null);
    const prevDependenciesRef = useRef<ReadonlyArray<unknown>>(null);
    const fiber = useFiber();

    const prevDependencies = prevDependenciesRef.current;
    prevDependenciesRef.current = dependencies;

    if (structuralIdRef.current == null || prevDependencies == null || !arrMatch(prevDependencies, dependencies)) {
        const structuralNodes: Array<[Fiber, string | number]> = [];

        structuralIdRef.current = 'foo';
        stopNodeRef.current = traverseFiber(
            fiber,
            true,
            function(node, ...args) {
                // console.log('node', node);
                structuralNodes.push([node, node.key ?? node.index]);
                return selector(node, ...args);
            },
        ) ?? null;

        console.log('strlist', structuralNodes);
    }
    
    return [structuralIdRef.current, stopNodeRef.current];
}

function arrMatch(arr1: ReadonlyArray<unknown>, arr2: ReadonlyArray<unknown>) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
