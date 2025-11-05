// src/main.jsx (or main.tsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Import the global CSS file here
import './styles/GlobalStyles.css'; 

// 2. Import the Icons SVG sprite and ensure it is rendered once (e.g., in App.jsx or Main Header)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);