import * as React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';

/* @ts-expect-error */
const root = ReactDOM.createRoot(document.getElementById('root'));

const {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: oldReactInternals,
  __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE:
    newReactInternals,
} = React as any

const oldCreateElement = React.createElement;
type CreateElementParams = Parameters<typeof React.createElement>;

// @ts-expect-error(2540) -- React.createElement should be used as readonly, but in this case it's fine because we want it to always set a context
React.createElement = /* prevent lint from moving function to same row as assignment due to ts-expect-error */
function (...args: CreateElementParams) {
  try {
    const owner = newReactInternals?.A?.getOwner?.();

    console.log('owner', owner);
  }
  catch(err) {
    console.error(err);
  }

  return oldCreateElement(...args);
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
