import {useFiber, traverseFiber} from 'its-fine';

type Selector = Parameters<typeof traverseFiber>[2];
export type StructuralId = string;
type StopNode = ReturnType<typeof traverseFiber>;

export default function useStructuralId(selector: Selector): [StructuralId, StopNode] {
    const fiber = useFiber();
    let structuralId = 'foo';
    const stopNode = traverseFiber(
        fiber,
        true,
        selector,
        // function(node, ...args) {
        //     return selector(node, ...args);
        // },
    );
    
    return [structuralId, stopNode];
}
