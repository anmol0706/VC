/**
 * PiP (Picture-in-Picture) Component
 * 
 * Floating draggable self-view video for the local user.
 * 
 * Features:
 * - Draggable within screen bounds
 * - Snaps to corners when released
 * - Shows muted indicator when audio is off
 * - Mirrors video for natural self-view
 * - Respects safe areas on mobile devices
 */

import { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'

function PiP({
    stream,
    isMuted = false,
    isVideoOff = false,
    filterStyle = {}
}) {
    // Reference to the draggable container
    const nodeRef = useRef(null)
    // Reference to the video element
    const videoRef = useRef(null)

    // Position state (bottom-right corner by default)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    // Bounds for dragging
    const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })

    /**
     * Calculate the draggable bounds based on window size
     */
    useEffect(() => {
        const updateBounds = () => {
            // Get the PiP container dimensions (120px width, aspect-ratio 3:4 = 160px height)
            const pipWidth = 120
            const pipHeight = 160
            // Safe area padding
            const safeTop = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--safe-area-inset-top')) || 0
            const safeBottom = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--safe-area-inset-bottom')) || 0

            // Control bar height (approximately)
            const controlBarHeight = 100

            setBounds({
                left: -(window.innerWidth - pipWidth - 16), // 16px margin
                top: -(window.innerHeight - pipHeight - 16 - safeTop - safeBottom - controlBarHeight),
                right: 0,
                bottom: 0
            })

            // Set initial position (bottom-right)
            setPosition({ x: 0, y: 0 })
        }

        updateBounds()
        window.addEventListener('resize', updateBounds)

        return () => window.removeEventListener('resize', updateBounds)
    }, [])

    /**
     * Attach local stream to video element when stream changes
     */
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    /**
     * Handle drag stop - snap to nearest corner
     */
    const handleDragStop = (e, data) => {
        const { x, y } = data
        const midX = bounds.left / 2
        const midY = bounds.top / 2

        // Snap to nearest corner
        const newX = x < midX ? bounds.left : 0
        const newY = y < midY ? bounds.top : 0

        setPosition({ x: newX, y: newY })
    }

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds={bounds}
            position={position}
            onStop={handleDragStop}
        >
            <div
                ref={nodeRef}
                className="pip-container"
                style={{
                    // Position in bottom-right corner with margins
                    position: 'fixed',
                    right: 16,
                    bottom: `calc(100px + var(--safe-area-inset-bottom, 0px))`,
                }}
            >
                {/* Video element - mirrored for natural self-view */}
                {!isVideoOff ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted // Always mute self-view to prevent echo
                        className="video-mirrored"
                        style={filterStyle}
                    />
                ) : (
                    // Placeholder when video is off
                    <div className="w-full h-full bg-dark-200 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-dark-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Muted indicator */}
                {isMuted && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 
                          flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    </div>
                )}

                {/* "You" label */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
                    <span className="text-xs text-white font-medium">You</span>
                </div>
            </div>
        </Draggable>
    )
}

export default PiP
