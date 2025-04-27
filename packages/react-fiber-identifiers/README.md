# react-fiber-identifiers

Utilities for identifying React fibers.

## react-fiber-identifiers/is-error-boundary

Returns `true` if fiber is for an error boundary, `false` if not.

```javascript
import isErrorBoundary from 'react-fiber-idenfitifers/is-error-boundary';

isErrorBoundary(fiberFrom_ErrorBoundary); // true
isErrorBoundary(fiberFrom_Non_ErrorBoundary); // false
```

## react-fiber-identifiers/is-suspense

Returns `true` if fiber is for a `React.Suspense`, `false` if not.

```javascript
import isSuspense from 'react-fiber-idenfitifers/is-error-boundary';

isSuspense(fiberFrom_ReactSuspense); // true
isSuspense(fiberFrom_AnythingElse); // false
```

## react-fiber-identifiers/get-unique-identifier

Returns a `string` for a fiber's "mount" state (`key`, or index within parent fiber node of `key` isn't specified in props).

```javascript
import getUniqueIdentifier from 'react-fiber-identifiers/get-unique-identifier';
```

## react-fiber-identifiers/testing/create-fiber

For jest environments, to create a React fiber.

```jsx
import createFiber from 'react-fiber-identifiers/testing/create-fiber';

createFiber(<Foo />); // creates a fiber from `Foo`
```