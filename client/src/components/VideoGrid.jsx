/**
 * VideoGrid Component
 * 
 * Displays remote participant videos in a responsive grid layout.
 * 
 * Features:
 * - Responsive layouts for 1-4 participants
 * - Tap-to-focus: clicking a participant makes them full-screen
 * - Portrait-first design optimized for mobile
 * - Name overlays for each participant
 * - Visual indicator for muted participants
 */

import { useRef, useEffect } from 'react'

function VideoGrid({
    participants,
    focusedId,
    onFocusParticipant
}) {
    // Determine the grid class based on participant count
    const getGridClass = () => {
        const count = participants.length
        if (count === 0) return ''
        if (count === 1) return 'video-grid-1'
        if (count === 2) return 'video-grid-2'
        if (count === 3) return 'video-grid-3'
        return 'video-grid-4'
    }

    // If there's a focused participant, show them full-screen
    if (focusedId) {
        const focusedParticipant = participants.find(p => p.odId === focusedId)
        if (focusedParticipant) {
            return (
                <div className="video-grid video-grid-1" onClick={() => onFocusParticipant(null)}>
                    <VideoTile
                        participant={focusedParticipant}
                        isFocused={true}
                        onClick={() => onFocusParticipant(null)}
                    />
                </div>
            )
        }
    }

    // If no participants, show waiting message
    if (participants.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-dark-200 flex items-center justify-center animate-pulse-ring">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <p className="text-sm">Waiting for others to join...</p>
                <p className="text-xs text-gray-500 mt-2">Share the room link to invite others</p>
            </div>
        )
    }

    return (
        <div className={`video-grid ${getGridClass()}`}>
            {participants.map(participant => (
                <VideoTile
                    key={participant.odId}
                    participant={participant}
                    isFocused={false}
                    onClick={() => onFocusParticipant(participant.odId)}
                />
            ))}
        </div>
    )
}

/**
 * VideoTile Component
 * Individual video tile for a participant
 */
function VideoTile({ participant, isFocused, onClick }) {
    const videoRef = useRef(null)

    // Attach stream to video element when it changes
    useEffect(() => {
        if (videoRef.current && participant.stream) {
            videoRef.current.srcObject = participant.stream
        }
    }, [participant.stream])

    return (
        <div
            className={`video-tile ${isFocused ? 'video-tile-focused' : ''}`}
            onClick={onClick}
        >
            {participant.stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                // Don't mute remote streams - we want to hear them!
                />
            ) : (
                // Placeholder when no stream
                <div className="w-full h-full bg-dark-200 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Participant name overlay */}
            <div className="video-tile-overlay">
                <div className="flex items-center gap-2">
                    {/* Muted indicator */}
                    {participant.isMuted && (
                        <span className="w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        </span>
                    )}
                    <span className="text-sm font-medium text-white truncate">
                        {participant.name || 'Participant'}
                    </span>
                </div>
            </div>

            {/* Tap to focus hint (shown on non-focused tiles in landscape or when multiple participants) */}
            {!isFocused && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded-full">
                        Tap to focus
                    </span>
                </div>
            )}
        </div>
    )
}

export default VideoGrid
