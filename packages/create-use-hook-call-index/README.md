# create-use-hook-call-index

This is a factory to create a hook that tracks it's "call index" within a component.

```javascript
import createUseHookCallIndex from 'create-use-hook-call-index';

const useHookCallIndex1 = createUseHookCallIndex();
const useHookCallIndex2 = createUseHookCallIndex();

function useMyHook() {
    useHookCallIndex1(); // 0
    useHookCallIndex1(); // 1
    useHookCallIndex1(); // 2

    useHookCallIndex2(); // 0
    useHookCallIndex1(); // 3
    
    useHookCallIndex2(); // 1
    useHookCallIndex2(); // 2
    useHookCallIndex2(); // 3
    
    useHookCallIndex1(); // 4
}
```

It's useful when you're using your own custom hook in multiple places, and wanting to differentiate them:

```javascript
import createUseHookCallIndex from 'create-use-hook-call-index';

const useHookCallIndex = createUseHookCallIndex();

function useMyHook() {
    if (__DEV__) {
        const index = useHookCallIndex1();

        if (index === 3) {
            console.warn(
                "You've used useMyHook exactly 3 times in this component. " +
                " Consider merging the logic into 1 useMyHook call."
            );
        }
    }
}
```
