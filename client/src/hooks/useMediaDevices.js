/**
 * useMediaDevices Hook
 * 
 * Manages camera and microphone access with permission handling.
 * 
 * Features:
 * - Request camera/mic permissions
 * - Toggle audio/video tracks
 * - Switch between front and back cameras (mobile)
 * - Track permission states
 * - Adaptive video quality settings
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Video quality presets for adaptive streaming
const VIDEO_CONSTRAINTS = {
    high: { width: 1280, height: 720, frameRate: 30 },
    medium: { width: 640, height: 480, frameRate: 24 },
    low: { width: 320, height: 240, frameRate: 15 }
}

export function useMediaDevices() {
    // Local media stream reference
    const streamRef = useRef(null)

    // State
    const [localStream, setLocalStream] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied'
    const [error, setError] = useState(null)
    const [facingMode, setFacingMode] = useState('user') // 'user' (front) | 'environment' (back)
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
    const [videoQuality, setVideoQuality] = useState('medium')

    /**
     * Check if device has multiple cameras (for camera switch feature)
     */
    useEffect(() => {
        const checkCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices()
                const videoDevices = devices.filter(d => d.kind === 'videoinput')
                setHasMultipleCameras(videoDevices.length > 1)
            } catch (err) {
                console.error('Failed to enumerate devices:', err)
            }
        }

        checkCameras()

        // Re-check when devices change
        navigator.mediaDevices?.addEventListener('devicechange', checkCameras)
        return () => {
            navigator.mediaDevices?.removeEventListener('devicechange', checkCameras)
        }
    }, [])

    /**
     * Get video constraints based on quality and facing mode
     */
    const getVideoConstraints = useCallback(() => {
        const quality = VIDEO_CONSTRAINTS[videoQuality] || VIDEO_CONSTRAINTS.medium
        return {
            facingMode,
            ...quality
        }
    }, [facingMode, videoQuality])

    /**
     * Request camera and microphone access
     * Returns the media stream if successful
     */
    const getMediaStream = useCallback(async () => {
        try {
            setError(null)

            // Request both audio and video
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: getVideoConstraints()
            })

            // Store the stream
            streamRef.current = stream
            setLocalStream(stream)
            setPermissionState('granted')

            // Apply current mute/video state
            stream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted
            })
            stream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoOff
            })

            return stream
        } catch (err) {
            console.error('Media access error:', err)

            // Determine the type of error
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionState('denied')
                setError('Camera/microphone permission denied. Please allow access in your browser settings.')
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera or microphone found. Please connect a device.')
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera or microphone is in use by another application.')
            } else {
                setError(`Failed to access camera/microphone: ${err.message}`)
            }

            return null
        }
    }, [getVideoConstraints, isMuted, isVideoOff])

    /**
     * Toggle microphone mute state
     */
    const toggleMute = useCallback(() => {
        if (streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks()
            const newMuteState = !isMuted

            audioTracks.forEach(track => {
                track.enabled = !newMuteState
            })

            setIsMuted(newMuteState)
        }
    }, [isMuted])

    /**
     * Toggle camera on/off state
     */
    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTracks = streamRef.current.getVideoTracks()
            const newVideoOffState = !isVideoOff

            videoTracks.forEach(track => {
                track.enabled = !newVideoOffState
            })

            setIsVideoOff(newVideoOffState)
        }
    }, [isVideoOff])

    /**
     * Switch between front and back camera
     * Requires getting a new stream with different facing mode
     */
    const switchCamera = useCallback(async () => {
        if (!hasMultipleCameras) {
            console.log('Device has only one camera')
            return
        }

        try {
            // Toggle facing mode
            const newFacingMode = facingMode === 'user' ? 'environment' : 'user'

            // Stop current video track
            if (streamRef.current) {
                streamRef.current.getVideoTracks().forEach(track => track.stop())
            }

            // Get new video stream with different camera
            const newVideoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: newFacingMode,
                    ...VIDEO_CONSTRAINTS[videoQuality]
                }
            })

            // Replace video track in the stream
            if (streamRef.current) {
                const newVideoTrack = newVideoStream.getVideoTracks()[0]
                const oldVideoTrack = streamRef.current.getVideoTracks()[0]

                if (oldVideoTrack) {
                    streamRef.current.removeTrack(oldVideoTrack)
                }

                // Ensure the new track is enabled (not paused)
                newVideoTrack.enabled = !isVideoOff
                streamRef.current.addTrack(newVideoTrack)

                // Create a new MediaStream to trigger React state update
                // (same reference won't trigger re-render)
                const updatedStream = new MediaStream([
                    ...streamRef.current.getAudioTracks(),
                    ...streamRef.current.getVideoTracks()
                ])
                streamRef.current = updatedStream
                setLocalStream(updatedStream)
            }

            setFacingMode(newFacingMode)
        } catch (err) {
            console.error('Failed to switch camera:', err)
            setError('Failed to switch camera. Please try again.')
        }
    }, [facingMode, hasMultipleCameras, videoQuality, isVideoOff])

    /**
     * Update video quality (for adaptive streaming)
     */
    const updateQuality = useCallback(async (quality) => {
        if (!['high', 'medium', 'low'].includes(quality)) return

        setVideoQuality(quality)

        // If we have an active stream, update the video track
        if (streamRef.current && !isVideoOff) {
            try {
                const videoTrack = streamRef.current.getVideoTracks()[0]
                if (videoTrack) {
                    await videoTrack.applyConstraints(VIDEO_CONSTRAINTS[quality])
                }
            } catch (err) {
                console.error('Failed to update video quality:', err)
            }
        }
    }, [isVideoOff])

    /**
     * Cleanup: stop all tracks when component unmounts
     */
    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop()
            })
            streamRef.current = null
            setLocalStream(null)
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup()
        }
    }, [cleanup])

    return {
        localStream,
        isMuted,
        isVideoOff,
        permissionState,
        error,
        hasMultipleCameras,
        facingMode,
        videoQuality,
        getMediaStream,
        toggleMute,
        toggleVideo,
        switchCamera,
        updateQuality,
        cleanup
    }
}
