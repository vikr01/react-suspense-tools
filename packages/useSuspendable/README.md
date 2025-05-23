# use-suspendable

This is a hook to create a "suspendable" -- a promise cached to the current element's structure, in such a way that when the component gets destroyed and recreated, it will be preserved.

This is useful when using it to suspend.

> [!WARNING]  
> This was designed to solve the problem where async requests are made in effects, not other uses of async with React.


# Migration from setting state in `useEffect`

Otherwise known as a cascading render, setting state in an effect is bad behavior, because effects are activated by... state updates.

[Read more about this in the react docs.](https://react.dev/learn/you-might-not-need-an-effect)


### Old version:
```jsx
import {useEffect, useState} from 'react';

function MyComponent({param}) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        expensiveAsyncFunction(param)
            .then((result)=>{
                setData(result);
            })
            .finally(()=>{
                setIsLoading(false);
            })
    }, [param]);

    // more hook code here

    return (
        <>
            {
                isLoading ? 
                    <LoadingState /> :
                    <DataRenderer data={data}>
            }
        </>
    );
}
```

### New version w/ `use` (`"react": ">=19.0.0"`):
```jsx
import {use} from 'react';
import useSuspendable from 'react-use-suspendable';

function MyComponent({param, ...passThroughProps}) {
    const [promise] = useSuspendable(
        ()=>expensiveAsyncFunction(param),
        [param]
    );
    const data = use(promise);

    // more hook code here

    return (
        <DataRenderer
            data={data}
            {...passThroughProps}
        />
    );
}

function MyComponentContainer(props) {
    return (
        <Suspense fallback={<LoadingState />}>
            <MyComponent {...props} />
        </Suspense>
    );
}
```

### `"react": ">=16.8 <19"`
You can use `use-suspendable/map-promise` or `use-suspendable/wrap-promise` or another promise synchronizer such as [p-state](https://github.com/sindresorhus/p-state).

```jsx
import useSuspendable from 'react-use-suspendable';
import wrapPromise, {
  getValue,
  getReason,
  isDone,
  isRejected,
} from 'react-use-suspendable/wrap-promise';

function MyComponent({param, ...passThroughProps}) {
    const [promise] = useSuspendable(
        ()=>wrapPromise(expensiveAsyncFunction(param)),
        [param]
    );

    if (isRejected(madePromise)) {
        throw getReason(madePromise); // throwing the error
    }

    if (!isDone(madePromise)) {
        throw madePromise;
    }

    const data = getValue(madePromise);

    // more hook code here

    return (
        <DataRenderer
            data={data}
            {...passThroughProps}
        />
    );
}

function MyComponentContainer(props) {
    return (
        <Suspense fallback={<LoadingState />}>
            <MyComponent {...props} />
        </Suspense>
    );
}
```

`use-suspendable/wrap-promise` and `use-suspendable/map-promise` have the same API, but work different internally -- `wrap-promise` will *modify* the promise to store its state while `map-promise` will *store* the promise in a `WeakMap` at the module-level.


## What's the difference?
- In the old version, we:
  1. rendered a loading state
  2. waited for first paint
  3. started fetching data
  4. once the data was fetched, we updated state
- In the new version, we:
  1. immediately started fetching data without waiting for a paint
  2. suspended while that data fetch had already started
  3. painted when the data came back

## Other benefits
- Delegated loading state higher up the component tree (`MyComponentContainer` in this case), allowing your component to handle just the rendering logic
- If the promise errors, you're leaving it up to `React` to decide how to handle it (i.e. `ErrorBoundary`)
- In the first example, there was no clean up of the promise.
  - Let's say `param` was `1` then became `2` before `expensiveAsyncFunction(1)` could complete. You'll call `setData` twice, but you don't know in what order.
    - [Read more about this in the react docs.](https://react.dev/reference/react/useEffect#:~:text=Note%20the%20ignore%20variable%20which%20is%20initialized%20to%20false%2C%20and%20is%20set%20to%20true%20during%20cleanup.%20This%20ensures%20your%20code%20doesn%E2%80%99t%20suffer%20from%20%E2%80%9Crace%20conditions%E2%80%9D%3A%20network%20responses%20may%20arrive%20in%20a%20different%20order%20than%20you%20sent%20them.)
  - This is now handled by `React`.

## Main use cases
When you have something asynchronous you need to fetch because of a state change, i.e. a search query.

Otherwise, you're better off caching the promise at the module-level.
