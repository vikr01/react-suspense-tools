import {use} from 'react';
import * as React from 'react';
/* @ts-expect-error */
import getRandomNumberPacket from "../api/getRandomNumberPacket";
import { JsonView, allExpanded} from 'react-json-view-lite';
/* @ts-expect-error */
import useSuspenseRef from '../hooks/useSuspenseRef';

const promise = getRandomNumberPacket(5);

type Props = {
    seed: string,
};

export default function RandomNumberPacket({seed}: Props): React.ReactElement {
    useSuspenseRef('foo');
    // const randomNumberPacket = use(promise);
    
    return <JsonView data={{}} shouldExpandNode={allExpanded}/>
}