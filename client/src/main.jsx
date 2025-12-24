/**
 * React Application Entry Point
 * This is the main entry file that mounts our React app to the DOM
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import global styles (Tailwind + custom CSS)
import './index.css'

// Mount the app to the root element
// StrictMode helps catch potential problems in development
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
