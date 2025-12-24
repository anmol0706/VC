/**
 * useWebRTC Hook
 * 
 * Manages WebRTC peer connections for video calling.
 * 
 * Architecture:
 * - Creates one RTCPeerConnection per remote participant
 * - Uses Socket.IO for signaling (offer/answer/ICE exchange)
 * - Handles connection lifecycle (create, negotiate, close)
 * 
 * Features:
 * - Automatic connection setup when new users join
 * - ICE candidate trickle for faster connection
 * - Connection state monitoring
 * - Graceful cleanup on disconnect
 * - Adaptive bitrate based on network conditions
 */

import { useRef, useState, useCallback, useEffect } from 'react'

// STUN servers for NAT traversal (using Google's public servers)
// For production, you might want to add TURN servers for better connectivity
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
}

export function useWebRTC({
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
}) {
    // Map of user ID -> RTCPeerConnection
    const peerConnectionsRef = useRef(new Map())

    // Map of user ID -> remote MediaStream
    const [remoteStreams, setRemoteStreams] = useState(new Map())

    // Connection states for each peer
    const [connectionStates, setConnectionStates] = useState(new Map())

    /**
     * Create a new peer connection for a remote user
     */
    const createPeerConnection = useCallback((remoteUserId) => {
        console.log(`📞 Creating peer connection for user: ${remoteUserId}`)

        // Don't create duplicate connections
        if (peerConnectionsRef.current.has(remoteUserId)) {
            console.log(`📞 Peer connection already exists for: ${remoteUserId}`)
            return peerConnectionsRef.current.get(remoteUserId)
        }

        // Create new RTCPeerConnection
        const peerConnection = new RTCPeerConnection(ICE_SERVERS)

        // ========================================
        // Add local tracks to the connection
        // ========================================
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream)
            })
        }

        // ========================================
        // Handle incoming remote tracks
        // ========================================
        peerConnection.ontrack = (event) => {
            console.log(`📹 Received remote track from: ${remoteUserId}`)
            const [remoteStream] = event.streams

            setRemoteStreams(prev => {
                const newMap = new Map(prev)
                newMap.set(remoteUserId, remoteStream)
                return newMap
            })
        }

        // ========================================
        // Handle ICE candidates
        // ========================================
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`🧊 Sending ICE candidate to: ${remoteUserId}`)
                sendIceCandidate(remoteUserId, event.candidate)
            }
        }

        // ========================================
        // Handle connection state changes
        // ========================================
        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState
            console.log(`📞 Connection state for ${remoteUserId}: ${state}`)

            setConnectionStates(prev => {
                const newMap = new Map(prev)
                newMap.set(remoteUserId, state)
                return newMap
            })

            // Handle disconnection
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                // Connection lost - could trigger reconnection logic here
                console.log(`📞 Connection ${state} for: ${remoteUserId}`)
            }
        }

        // ========================================
        // Handle ICE connection state (for monitoring)
        // ========================================
        peerConnection.oniceconnectionstatechange = () => {
            console.log(`🧊 ICE state for ${remoteUserId}: ${peerConnection.iceConnectionState}`)
        }

        // Store the connection
        peerConnectionsRef.current.set(remoteUserId, peerConnection)

        return peerConnection
    }, [localStream, sendIceCandidate])

    /**
     * Create and send an offer to a remote user
     * Called when we are the "initiator" of the connection
     */
    const createOffer = useCallback(async (remoteUserId) => {
        console.log(`📤 Creating offer for: ${remoteUserId}`)

        const peerConnection = createPeerConnection(remoteUserId)

        try {
            // Create offer
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            })

            // Set local description
            await peerConnection.setLocalDescription(offer)

            // Send offer via signaling server
            sendOffer(remoteUserId, offer)
        } catch (err) {
            console.error(`Failed to create offer for ${remoteUserId}:`, err)
        }
    }, [createPeerConnection, sendOffer])

    /**
     * Handle incoming offer and create answer
     * Called when we receive an offer from another user
     */
    const handleOffer = useCallback(async ({ fromUserId, offer }) => {
        console.log(`📥 Received offer from: ${fromUserId}`)

        const peerConnection = createPeerConnection(fromUserId)

        try {
            // Set remote description (the offer we received)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

            // Create answer
            const answer = await peerConnection.createAnswer()

            // Set local description
            await peerConnection.setLocalDescription(answer)

            // Send answer back
            sendAnswer(fromUserId, answer)
        } catch (err) {
            console.error(`Failed to handle offer from ${fromUserId}:`, err)
        }
    }, [createPeerConnection, sendAnswer])

    /**
     * Handle incoming answer
     * Called when we receive an answer to our offer
     */
    const handleAnswer = useCallback(async ({ fromUserId, answer }) => {
        console.log(`📥 Received answer from: ${fromUserId}`)

        const peerConnection = peerConnectionsRef.current.get(fromUserId)

        if (!peerConnection) {
            console.error(`No peer connection found for: ${fromUserId}`)
            return
        }

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (err) {
            console.error(`Failed to handle answer from ${fromUserId}:`, err)
        }
    }, [])

    /**
     * Handle incoming ICE candidate
     */
    const handleIceCandidate = useCallback(async ({ fromUserId, candidate }) => {
        console.log(`🧊 Received ICE candidate from: ${fromUserId}`)

        const peerConnection = peerConnectionsRef.current.get(fromUserId)

        if (!peerConnection) {
            console.error(`No peer connection found for: ${fromUserId}`)
            return
        }

        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
            console.error(`Failed to add ICE candidate from ${fromUserId}:`, err)
        }
    }, [])

    /**
     * Handle user joining - initiate connection
     */
    const handleUserJoined = useCallback(({ odId }) => {
        console.log(`👋 User joined, creating offer for: ${odId}`)
        // We are the initiator since we were here first
        createOffer(odId)
    }, [createOffer])

    /**
     * Handle user leaving - cleanup connection
     */
    const handleUserLeft = useCallback(({ odId }) => {
        console.log(`👋 User left, cleaning up: ${odId}`)

        // Close and remove the peer connection
        const peerConnection = peerConnectionsRef.current.get(odId)
        if (peerConnection) {
            peerConnection.close()
            peerConnectionsRef.current.delete(odId)
        }

        // Remove the remote stream
        setRemoteStreams(prev => {
            const newMap = new Map(prev)
            newMap.delete(odId)
            return newMap
        })

        // Remove connection state
        setConnectionStates(prev => {
            const newMap = new Map(prev)
            newMap.delete(odId)
            return newMap
        })
    }, [])

    /**
     * Cleanup all connections
     */
    const cleanup = useCallback(() => {
        console.log('🧹 Cleaning up all WebRTC connections')

        peerConnectionsRef.current.forEach((pc, odId) => {
            pc.close()
        })
        peerConnectionsRef.current.clear()
        setRemoteStreams(new Map())
        setConnectionStates(new Map())
    }, [])

    /**
     * Replace local tracks in all peer connections
     * Used when switching cameras or updating video quality
     */
    const replaceTrack = useCallback(async (oldTrack, newTrack) => {
        for (const [odId, peerConnection] of peerConnectionsRef.current) {
            const senders = peerConnection.getSenders()
            const sender = senders.find(s => s.track?.kind === newTrack.kind)

            if (sender) {
                try {
                    await sender.replaceTrack(newTrack)
                    console.log(`📹 Replaced ${newTrack.kind} track for: ${odId}`)
                } catch (err) {
                    console.error(`Failed to replace track for ${odId}:`, err)
                }
            }
        }
    }, [])

    // ========================================
    // Subscribe to signaling events
    // ========================================
    useEffect(() => {
        if (!socket) return

        // Set up event listeners
        const unsubOffer = onOffer(handleOffer)
        const unsubAnswer = onAnswer(handleAnswer)
        const unsubIce = onIceCandidate(handleIceCandidate)
        const unsubJoined = onUserJoined(handleUserJoined)
        const unsubLeft = onUserLeft(handleUserLeft)

        // Cleanup
        return () => {
            unsubOffer()
            unsubAnswer()
            unsubIce()
            unsubJoined()
            unsubLeft()
            cleanup()
        }
    }, [
        socket,
        onOffer,
        onAnswer,
        onIceCandidate,
        onUserJoined,
        onUserLeft,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        handleUserJoined,
        handleUserLeft,
        cleanup
    ])

    // ========================================
    // Update local tracks when stream changes
    // ========================================
    useEffect(() => {
        if (!localStream) return

        // Add tracks to existing connections
        for (const [odId, peerConnection] of peerConnectionsRef.current) {
            const senders = peerConnection.getSenders()

            localStream.getTracks().forEach(track => {
                const existingSender = senders.find(s => s.track?.kind === track.kind)

                if (existingSender) {
                    existingSender.replaceTrack(track).catch(err => {
                        console.error(`Failed to replace track for ${odId}:`, err)
                    })
                } else {
                    peerConnection.addTrack(track, localStream)
                }
            })
        }
    }, [localStream])

    return {
        remoteStreams,
        connectionStates,
        createOffer,
        replaceTrack,
        cleanup
    }
}
