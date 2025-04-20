import './App.css';
import {Suspense} from 'react';
import { FiberProvider } from 'its-fine';
import * as React from 'react';
import RandomNumberPacket from './RandomNumberPacket';

export default function App(): React.ReactElement {
  return (
    <div className="App">
      <div className="suspense-root">
        <div className="suspense-container">
          <Suspense fallback={<div>Loading1</div>}>
            <RandomNumberPacket seed="foobar"/>
          </Suspense>
        </div>
        <div className="suspense-container">
          <Suspense fallback={<div>Loading2</div>}>
            <div/>
            <div/>
            <div/>
            <RandomNumberPacket seed="barfoo"/>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

type T = React.Component;