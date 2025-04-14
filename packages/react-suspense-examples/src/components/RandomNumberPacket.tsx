import * as React from 'react';
import getRandomNumberPacket from "../api/getRandomNumberPacket";
import { JsonView, allExpanded} from 'react-json-view-lite';
import useSuspenseRef from 'use-suspense-ref';

const promise = getRandomNumberPacket('5');

type Props = {
    seed: string,
};

export default function RandomNumberPacket({seed}: Props): React.ReactElement {
    useSuspenseRef('foo');
    // const randomNumberPacket = use(promise);
    
    return <JsonView data={{}} shouldExpandNode={allExpanded}/>
}