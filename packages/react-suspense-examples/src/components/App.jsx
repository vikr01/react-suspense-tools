import './App.css';
import {Suspense} from 'react';
import { FiberProvider } from 'its-fine';
import * as React from 'react';
import RandomNumberPacket from './RandomNumberPacket';

function App() {
  return (
    <FiberProvider>
      <div className="App">
        <div className="suspense-root">
          <div className="suspense-container">
            <Suspense>
              <RandomNumberPacket seed="foobar"/>
            </Suspense>
          </div>
          <div className="suspense-container">
            <Suspense fallback={null}>
              <RandomNumberPacket seed="barfoo"/>
            </Suspense>
          </div>
        </div>
      </div>
    </FiberProvider>
  );
}

export default App;
