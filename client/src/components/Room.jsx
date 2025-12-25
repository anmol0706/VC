/**
 * Room Component
 * 
 * Main video call room that orchestrates:
 * - Media device access (camera/mic)
 * - Socket.IO connection for signaling
 * - WebRTC peer connections
 * - UI components (video grid, controls, PiP)
 * 
 * This is the heart of the video calling functionality.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

// Components
import VideoGrid from './VideoGrid'
import Controls from './Controls'
import PiP from './PiP'
import ParticipantsList from './ParticipantsList'
import FilterPanel from './FilterPanel'

// Hooks
import { useSocket } from '../hooks/useSocket'
import { useMediaDevices } from '../hooks/useMediaDevices'
import { useWebRTC } from '../hooks/useWebRTC'
import { useVideoFilters } from '../hooks/useVideoFilters'

function Room() {
    // Get room ID from URL parameters
    const { roomId } = useParams()
    const navigate = useNavigate()

    // Generate a unique user ID for this session
    // Using useMemo to ensure it stays consistent across re-renders
    const userId = useMemo(() => uuidv4().substring(0, 8), [])

    // ========================================
    // State
    // ========================================

    // UI state
    const [showParticipants, setShowParticipants] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [focusedParticipantId, setFocusedParticipantId] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // ========================================
    // Hooks
    // ========================================

    // Media devices (camera, microphone)
    const {
        localStream,
        isMuted,
        isVideoOff,
        permissionState,
        error: mediaError,
        hasMultipleCameras,
        getMediaStream,
        toggleMute,
        toggleVideo,
        switchCamera,
        cleanup: cleanupMedia
    } = useMediaDevices()

    // Socket.IO connection for signaling
    const {
        socket,
        isConnected,
        error: socketError,
        participants,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        onOffer,
        onAnswer,
        onIceCandidate,
        onUserJoined,
        onUserLeft
    } = useSocket(roomId, userId)

    // WebRTC peer connections
    const {
        remoteStreams,
        connectionStates,
        cleanup: cleanupWebRTC
    } = useWebRTC({
        localStream,
        socket,
        onOffer,
        onAnswer,
        onIceCandidate,
        onUserJoined,
        onUserLeft,
        sendOffer,
        sendAnswer,
        sendIceCandidate
    })

    // Video filters
    const {
        currentFilter,
        filterStyle,
        availableFilters,
        setFilter,
        hasActiveFilter
    } = useVideoFilters()

    // ========================================
    // Initialize media on mount
    // ========================================
    useEffect(() => {
        const initMedia = async () => {
            setIsLoading(true)
            const stream = await getMediaStream()

            if (stream) {
                setIsLoading(false)
            } else {
                // Media access failed - error is set in the hook
                setIsLoading(false)
            }
        }

        initMedia()

        // Cleanup on unmount
        return () => {
            cleanupMedia()
            cleanupWebRTC()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ========================================
    // Error handling
    // ========================================
    useEffect(() => {
        if (mediaError) {
            setError(mediaError)
        } else if (socketError) {
            setError(socketError)
        } else {
            setError(null)
        }
    }, [mediaError, socketError])

    // ========================================
    // Event handlers
    // ========================================

    /**
     * End the call and return to home
     */
    const handleEndCall = useCallback(() => {
        cleanupMedia()
        cleanupWebRTC()
        navigate('/')
    }, [cleanupMedia, cleanupWebRTC, navigate])

    /**
     * Toggle participants panel
     */
    const handleToggleParticipants = useCallback(() => {
        setShowParticipants(prev => !prev)
    }, [])

    /**
     * Focus on a specific participant (tap-to-focus)
     */
    const handleFocusParticipant = useCallback((participantId) => {
        setFocusedParticipantId(participantId)
    }, [])

    // ========================================
    // Prepare participants data for components
    // ========================================
    const participantsWithStreams = useMemo(() => {
        return participants.map(p => ({
            ...p,
            odId: p.odId,
            stream: remoteStreams.get(p.odId),
            connectionState: connectionStates.get(p.odId)
        }))
    }, [participants, remoteStreams, connectionStates])

    // ========================================
    // Render loading state
    // ========================================
    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-dark-300">
                <div className="loading-spinner mb-4"></div>
                <p className="text-gray-400">Starting camera...</p>
            </div>
        )
    }

    // ========================================
    // Render permission denied state
    // ========================================
    if (permissionState === 'denied') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-dark-300 px-6">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Camera Access Denied</h2>
                <p className="text-gray-400 text-center mb-6">
                    Please allow camera and microphone access in your browser settings to join the call.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl
                     font-medium transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    // ========================================
    // Render error state
    // ========================================
    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-dark-300 px-6">
                <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-gray-400 text-center mb-6">{error}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl
                       font-medium transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl
                       font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    // ========================================
    // Main room render
    // ========================================
    return (
        <div className="h-full flex flex-col bg-dark-300 relative">
            {/* Room ID badge (top) */}
            <div className="absolute top-4 left-4 z-30 safe-area-top">
                <div className="glass px-3 py-2 rounded-full flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                    <span className="text-xs font-medium">{roomId}</span>
                </div>
            </div>

            {/* Video Grid (main area) */}
            <div className="flex-1 relative overflow-hidden">
                <VideoGrid
                    participants={participantsWithStreams}
                    focusedId={focusedParticipantId}
                    onFocusParticipant={handleFocusParticipant}
                />
            </div>

            {/* Self-view PiP */}
            {localStream && (
                <PiP
                    stream={localStream}
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    filterStyle={filterStyle}
                />
            )}

            {/* Bottom Controls */}
            <Controls
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onSwitchCamera={switchCamera}
                onToggleFilters={() => setShowFilters(true)}
                onEndCall={handleEndCall}
                onToggleParticipants={handleToggleParticipants}
                participantCount={participants.length + 1} // +1 for self
                canSwitchCamera={hasMultipleCameras}
                hasActiveFilter={hasActiveFilter}
            />

            {/* Participants List Panel */}
            <ParticipantsList
                participants={participantsWithStreams}
                localUserId={userId}
                roomId={roomId}
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
            />

            {/* Filter Panel */}
            <FilterPanel
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={availableFilters}
                currentFilter={currentFilter}
                onSelectFilter={setFilter}
            />
        </div>
    )
}

export default Room
