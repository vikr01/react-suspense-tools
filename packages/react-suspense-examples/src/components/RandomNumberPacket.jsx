import {use} from 'react';
import * as React from 'react';
import getRandomNumberPacket from "../api/getRandomNumberPacket";
import { JsonView, allExpanded} from 'react-json-view-lite';
import useSuspenseRef from '../hooks/useSuspenseRef';

const promise = getRandomNumberPacket(5);

export default function RandomNumberPacket({seed}) {
    useSuspenseRef('foo');
    // const randomNumberPacket = use(promise);
    
    return <JsonView data={null} shouldExpandNode={allExpanded}/>
}