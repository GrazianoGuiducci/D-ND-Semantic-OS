
import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './src/Main';

// CACHE BUSTING LOG v15.0 - FINAL
console.log('D-ND OS: MAIN ROOT ENGAGED [V15.0]');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
