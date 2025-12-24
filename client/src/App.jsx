/**
 * Main App Component
 * Sets up routing between Home screen and Room screen
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Room from './components/Room'

function App() {
    return (
        // BrowserRouter enables client-side routing
        <BrowserRouter>
            {/* Main app container with full height and safe area padding */}
            <div className="h-full w-full bg-dark-300 safe-area-top safe-area-left safe-area-right">
                <Routes>
                    {/* Home screen - Create or Join a room */}
                    <Route path="/" element={<Home />} />

                    {/* Room screen - The actual video call */}
                    {/* :roomId is a URL parameter that we can access in the Room component */}
                    <Route path="/room/:roomId" element={<Room />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
