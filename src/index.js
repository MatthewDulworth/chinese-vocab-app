import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {EasybaseProvider} from 'easybase-react';
import ebconfig from './ebconfig';

ReactDOM.render(
  <React.StrictMode>
    <EasybaseProvider ebconfig={ebconfig}>
      <App />
    </EasybaseProvider>
  </React.StrictMode>,
  document.getElementById('root')
);