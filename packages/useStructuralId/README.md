# use-structural-id

Hook to get the structural ID for a React fiber node.

```jsx
<Foo>
    <Bar key={0}>
        <BazFoo />
        <FooFoo /> {/* FooFoo calls useStructuralID */}
    </Bar>
</Foo>
```

The result of calling `useStructuralID` from `FooFoo` will be a string representing the connection: `(FooFoo at index 1)->(Bar with key 0)->(Foo at index 0)`.


## Usage

```javascript
import useStructuralId from 'use-structural-id';

function useMyHook() {
    const structuralId = useStructuralId(
        (fiberNode)=>fiberNode.elementType === Foo, // selector for where to stop the traversal upward, in this case stopping when we reach an element of component type `Foo`
        [], // dependencies
    );
}
```
