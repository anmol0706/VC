/**
 * Home Component
 * 
 * This is the landing screen where users can:
 * 1. Create a new room (generates a unique ID)
 * 2. Join an existing room via Room ID
 * 
 * Features:
 * - One-tap copy room link
 * - Input validation for room IDs
 * - Clean, mobile-first UI
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

function Home() {
    // State for the room ID input field
    const [roomId, setRoomId] = useState('')
    // State to show the created room info (for copy link feature)
    const [createdRoom, setCreatedRoom] = useState(null)
    // State for error messages
    const [error, setError] = useState('')
    // State for copy confirmation
    const [copied, setCopied] = useState(false)

    // React Router's navigation hook
    const navigate = useNavigate()

    /**
     * Creates a new room with a unique ID
     * Uses UUID v4 for generating unique, collision-resistant IDs
     */
    const handleCreateRoom = () => {
        // Generate a short, memorable room ID (first 8 chars of UUID)
        const newRoomId = uuidv4().substring(0, 8)
        setCreatedRoom(newRoomId)
        setError('')
        setCopied(false)
    }

    /**
     * Joins an existing room
     * Validates that a room ID is provided before navigating
     */
    const handleJoinRoom = () => {
        // Trim whitespace and validate
        const trimmedId = roomId.trim()

        if (!trimmedId) {
            setError('Please enter a Room ID')
            return
        }

        // Navigate to the room
        navigate(`/room/${trimmedId}`)
    }

    /**
     * Enters the room that was just created
     */
    const handleEnterCreatedRoom = () => {
        if (createdRoom) {
            navigate(`/room/${createdRoom}`)
        }
    }

    /**
     * Copies the room link to clipboard
     * Shows a confirmation message after copying
     */
    const handleCopyLink = async () => {
        if (!createdRoom) return

        // Construct the full URL
        const roomUrl = `${window.location.origin}/room/${createdRoom}`

        try {
            // Use the Clipboard API to copy
            await navigator.clipboard.writeText(roomUrl)
            setCopied(true)
            // Reset the "Copied!" message after 2 seconds
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            // Fallback: show the URL for manual copying
            setError('Could not copy. URL: ' + roomUrl)
        }
    }

    /**
     * Handles Enter key press in the input field
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleJoinRoom()
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center px-6 py-8">
            {/* Logo/Title Section */}
            <div className="text-center mb-12">
                {/* App Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">MeetUp</h1>
                <p className="text-gray-400 text-sm">Video calls made simple</p>
            </div>

            {/* Main Actions Card */}
            <div className="w-full max-w-sm space-y-6">

                {/* Create Room Section */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Start a Meeting</h2>

                    {!createdRoom ? (
                        // Show Create Room button
                        <button
                            onClick={handleCreateRoom}
                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 
                         text-white font-medium rounded-xl
                         active:scale-[0.98] transition-all duration-150
                         shadow-lg shadow-blue-500/25"
                        >
                            Create Room
                        </button>
                    ) : (
                        // Show created room info with copy & join options
                        <div className="space-y-3 animate-fade-in">
                            {/* Room ID Display */}
                            <div className="flex items-center gap-3 bg-dark-300 rounded-xl p-4">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 mb-1">Room ID</p>
                                    <p className="text-lg font-mono font-semibold">{createdRoom}</p>
                                </div>
                                {/* Copy Button */}
                                <button
                                    onClick={handleCopyLink}
                                    className="control-btn control-btn-primary"
                                    title="Copy room link"
                                >
                                    {copied ? (
                                        // Checkmark icon when copied
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        // Copy icon
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Join Created Room Button */}
                            <button
                                onClick={handleEnterCreatedRoom}
                                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 
                           text-white font-medium rounded-xl
                           active:scale-[0.98] transition-all duration-150
                           shadow-lg shadow-green-500/25"
                            >
                                Enter Room
                            </button>

                            {/* Create Another Room Link */}
                            <button
                                onClick={() => {
                                    setCreatedRoom(null)
                                    setCopied(false)
                                }}
                                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Create a different room
                            </button>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-gray-500 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Join Room Section */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Join a Meeting</h2>

                    {/* Room ID Input */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => {
                                setRoomId(e.target.value)
                                setError('') // Clear error when typing
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter Room ID"
                            className="w-full py-4 px-5 bg-dark-300 text-white rounded-xl
                         border border-white/10 focus:border-blue-500
                         outline-none transition-colors
                         placeholder:text-gray-500"
                        />

                        {/* Error Message */}
                        {error && (
                            <p className="text-red-400 text-sm animate-fade-in">{error}</p>
                        )}

                        {/* Join Button */}
                        <button
                            onClick={handleJoinRoom}
                            className="w-full py-4 px-6 bg-white/10 hover:bg-white/15
                         text-white font-medium rounded-xl
                         active:scale-[0.98] transition-all duration-150
                         border border-white/10"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-12 text-gray-500 text-xs text-center">
                Secure peer-to-peer video calls
            </p>
        </div>
    )
}

export default Home
