import { StrictMode } from 'react'
// createRoot is React 18's way to render your app to the DOM
import { createRoot } from 'react-dom/client'
// Import global CSS styles that will apply to your entire app
import './index.css'
// Import the main App component, which is the root of your React component tree
import App from './App.jsx'

// Find the HTML element with id 'root' (in index.html) and start React inside it
createRoot(document.getElementById('root')).render(
  // StrictMode helps find potential problems by running checks and warnings during development
  <StrictMode>
    {/* Mount our App component inside the DOM element */}
    <App />
  </StrictMode>,
)
