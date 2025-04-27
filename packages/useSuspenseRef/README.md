# use-suspense-ref

`useSuspenseRef` looks just like `useRef`, but behaves differently in where it stores data.

`useRef` stores data to the currently rendered React element.
- When the React element suspends, the data is lost, as it's been *unmounted*.

`useSuspenseRef` stores data to *the closest Suspense boundary*.
- When the element suspends, the data is *not* lost, because its Suspense boundary is *not unmounted*.
  - Instead, the data is destroyed once the Suspense boundary is unmounted.


```javascript
import {use, useRef} from 'react';
import useSuspenseRef from 'use-suspense-ref';

let i = 0;

function useMyHook({promise}) {   
    const suspenseRef = useSuspenseRef('foo');
    const regularRef = useRef('foo');

    console.log(suspenseRef.current, regularRef.current);
    /* First render: 'foo, foo'
     * Second render: 'bar, foo'
     */

    suspenseRef.current = 'bar';
    regularRef.current = 'bar';

    use(promise); // throws the promise
}
```
