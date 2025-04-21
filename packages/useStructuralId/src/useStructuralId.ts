import * as React from 'react';
import {traverseFiber, type Fiber} from 'its-fine';
import {useRef} from 'react';
import createUseHookCallIndex from 'create-use-hook-call-index';
import {createArrayIdWithNumber} from './createStructuralId'
import type {Writable} from 'type-fest';

const useHookCallIndex = createUseHookCallIndex();

export type {Fiber};
export type Selector = null | Parameters<typeof traverseFiber>[2];
export type StructuralId = string;
export type StopNode = Fiber | null;

export default function useStructuralId(selector: Selector, dependencies: ReadonlyArray<unknown>): [StructuralId, StopNode] {
    const stopNodeRef = useRef<StopNode>(null);
    const structuralIdRef = useRef<StructuralId>(null);

    const prevDependenciesRef = useRef<ReadonlyArray<unknown>>(null);

    const hookCallIndex = useHookCallIndex();

    const fiber: Fiber | null = (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.A?.getOwner?.() ?? null;

    if (fiber == null) {
        throw new Error('Couldn\'t find an element currently being rendered');
    }

    const prevDependencies = prevDependenciesRef.current;
    prevDependenciesRef.current = dependencies;

    if (structuralIdRef.current == null || prevDependencies == null || !arrMatch(prevDependencies, dependencies)) {
        const structuralNodes: Writable<Parameters<typeof createArrayIdWithNumber>[1]> = [];

        structuralIdRef.current = 'foo';
        stopNodeRef.current = traverseFiber(
            fiber,
            true,
            function(node, ...args) {
                structuralNodes.push([node.elementType, node.key ?? node.index]);
                return selector?.(node, ...args);
            },
        ) ?? null;

        structuralIdRef.current = createArrayIdWithNumber(hookCallIndex, structuralNodes);
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
