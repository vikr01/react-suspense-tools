import {useFiber, traverseFiber} from 'its-fine';

export default function useStructuralId(selector: Parameters<typeof traverseFiber>[2]) {
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
