/**
 * Controls Component
 * 
 * Bottom fixed control bar for the video call with:
 * - Microphone toggle
 * - Camera toggle
 * - Camera switch (front/back)
 * - End call button
 * - Participants list toggle
 * 
 * Features:
 * - Large touch targets (56px minimum)
 * - Auto-hide after 3 seconds of inactivity
 * - Tap anywhere to show controls
 * - Visual feedback for muted/disabled states
 */

import { useState, useEffect, useCallback } from 'react'

function Controls({
    isMuted,
    isVideoOff,
    onToggleMute,
    onToggleVideo,
    onSwitchCamera,
    onToggleFilters,
    onEndCall,
    onToggleParticipants,
    participantCount = 1,
    canSwitchCamera = true,
    hasActiveFilter = false
}) {
    // State to control visibility of the control bar
    const [isVisible, setIsVisible] = useState(true)
    // Timer reference for auto-hide
    const [hideTimer, setHideTimer] = useState(null)

    /**
     * Resets the auto-hide timer
     * Called whenever user interacts with controls
     */
    const resetHideTimer = useCallback(() => {
        // Clear existing timer
        if (hideTimer) {
            clearTimeout(hideTimer)
        }

        // Show controls
        setIsVisible(true)

        // Set new timer to hide after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 3000)

        setHideTimer(timer)
    }, [hideTimer])

    /**
     * Handle tap anywhere on screen to show controls
     */
    useEffect(() => {
        const handleTap = () => {
            if (!isVisible) {
                setIsVisible(true)
            }
            resetHideTimer()
        }

        // Add touch/click listener to document
        document.addEventListener('touchstart', handleTap)
        document.addEventListener('click', handleTap)

        // Cleanup
        return () => {
            document.removeEventListener('touchstart', handleTap)
            document.removeEventListener('click', handleTap)
            if (hideTimer) {
                clearTimeout(hideTimer)
            }
        }
    }, [isVisible, resetHideTimer, hideTimer])

    /**
     * Wrapper for button clicks that also resets the hide timer
     */
    const handleButtonClick = (callback) => (e) => {
        e.stopPropagation() // Prevent event bubbling
        resetHideTimer()
        callback()
    }

    return (
        <div
            className={`control-bar ${!isVisible ? 'control-bar-hidden' : ''}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-center gap-4 py-4 px-6">

                {/* Microphone Toggle Button */}
                <button
                    onClick={handleButtonClick(onToggleMute)}
                    className={`control-btn ${isMuted ? 'control-btn-muted' : 'control-btn-primary'}`}
                    aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                    {isMuted ? (
                        // Muted microphone icon
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        // Active microphone icon
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>

                {/* Camera Toggle Button */}
                <button
                    onClick={handleButtonClick(onToggleVideo)}
                    className={`control-btn ${isVideoOff ? 'control-btn-muted' : 'control-btn-primary'}`}
                    aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? (
                        // Camera off icon
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    ) : (
                        // Camera on icon
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>

                {/* Camera Switch Button (front/back) - Only shown on mobile with multiple cameras */}
                {canSwitchCamera && (
                    <button
                        onClick={handleButtonClick(onSwitchCamera)}
                        className="control-btn control-btn-primary"
                        aria-label="Switch camera"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}

                {/* Filter Button */}
                <button
                    onClick={handleButtonClick(onToggleFilters)}
                    className={`control-btn ${hasActiveFilter ? 'control-btn-active' : 'control-btn-primary'}`}
                    aria-label="Video filters"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </button>

                {/* End Call Button */}
                <button
                    onClick={handleButtonClick(onEndCall)}
                    className="control-btn control-btn-danger"
                    aria-label="End call"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                    </svg>
                </button>

                {/* Participants Button */}
                <button
                    onClick={handleButtonClick(onToggleParticipants)}
                    className="control-btn control-btn-primary relative"
                    aria-label="View participants"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {/* Participant count badge */}
                    {participantCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full 
                            text-xs font-bold flex items-center justify-center">
                            {participantCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}

export default Controls
