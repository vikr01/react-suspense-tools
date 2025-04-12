import {useFiber, traverseFiber} from 'its-fine';

export default function useStructuralId(selector) {
    const fiber = useFiber();
    let structuralId = 'foo';
    const stopNode = traverseFiber(
        fiber,
        true,
        function(node, ...args) {
            return selector(node, ...args);
        },
    );
    
    return [structuralId, stopNode];
}