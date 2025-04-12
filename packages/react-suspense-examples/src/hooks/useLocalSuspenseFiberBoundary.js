import { useEffect, useState } from 'react';
import * as React from 'react';
import {useFiber, traverseFiber } from 'its-fine';

function getInternals() {
    return React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ?? React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
}

// Tags
const SUSPENSE_COMPONENT = 13;
const HOST_ROOT = 3;


export default function useLocalSuspenseFiberBoundary() {
  const fiber = useFiber();
  console.log('fiber', fiber);
  const boundary = traverseFiber(fiber, true, (node)=>{
    return node.type === React.Suspense;
  });
  // const boundary = useNearestParent(React.Suspense);
  console.log('boundary', boundary);


  // const [boundary, setBoundary] = useState(null);
  // useEffect(() => {
  //   const internals = getInternals();
  //   const currentFiber = internals?.ReactCurrentOwner?.current;
  //   console.log('react internals', internals?.ReactCurrentOwner);
  //   if (!currentFiber) return;

  //   const suspense = findLocalSuspenseBoundary(currentFiber);
  //   setBoundary(suspense);
  // }, []);

  // return boundary;
}

function findLocalSuspenseBoundary(fiber) {
  let current = fiber.return;

  while (current) {
    if (current.tag === SUSPENSE_COMPONENT) return current;
    if (current.tag === HOST_ROOT) break; // Stop at portal root or main tree root
    current = current.return;
  }

  return null;
}
