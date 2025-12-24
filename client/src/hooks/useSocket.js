/**
 * useSocket Hook
 * 
 * Manages Socket.IO connection for real-time signaling.
 * 
 * Features:
 * - Automatic connection to signaling server
 * - Room join/leave events
 * - WebRTC signaling relay (offer, answer, ICE candidates)
 * - Reconnection handling
 * - Connection state tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

// Server URL - use environment variable or default to localhost
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export function useSocket(roomId, userId) {
    // Socket instance reference (persists across re-renders)
    const socketRef = useRef(null)

    // Connection state
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState(null)

    // Participants in the room (list of user IDs and their info)
    const [participants, setParticipants] = useState([])

    /**
     * Initialize Socket.IO connection
     */
    useEffect(() => {
        if (!roomId || !userId) return

        // Create socket connection
        const socket = io(SERVER_URL, {
            // Reconnection settings
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            // Transport - prefer WebSocket
            transports: ['websocket', 'polling']
        })

        socketRef.current = socket

        // ========================================
        // Connection event handlers
        // ========================================

        socket.on('connect', () => {
            console.log('🔌 Connected to signaling server')
            setIsConnected(true)
            setError(null)

            // Join the room once connected
            socket.emit('join-room', { roomId, userId })
        })

        socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected:', reason)
            setIsConnected(false)

            if (reason === 'io server disconnect') {
                // Server forced disconnect - try to reconnect
                socket.connect()
            }
        })

        socket.on('connect_error', (err) => {
            console.error('🔌 Connection error:', err.message)
            setError('Failed to connect to server')
            setIsConnected(false)
        })

        // ========================================
        // Room event handlers
        // ========================================

        // When we successfully join a room
        socket.on('room-joined', ({ participants: existingParticipants }) => {
            console.log('🏠 Joined room with participants:', existingParticipants)
            setParticipants(existingParticipants.filter(p => p.odId !== userId))
        })

        // When another user joins
        socket.on('user-joined', ({ odId: odUserId, name }) => {
            console.log('👋 User joined:', odUserId)
            setParticipants(prev => {
                // Avoid duplicates
                if (prev.find(p => p.odId === odUserId)) return prev
                return [...prev, { odId: odUserId, name }]
            })
        })

        // When a user leaves
        socket.on('user-left', ({ odId: odUserId }) => {
            console.log('👋 User left:', odUserId)
            setParticipants(prev => prev.filter(p => p.odId !== odUserId))
        })

        // Room not found error
        socket.on('room-error', ({ message }) => {
            console.error('🏠 Room error:', message)
            setError(message)
        })

        // Room is full
        socket.on('room-full', () => {
            setError('Room is full (max 4 participants)')
        })

        // Cleanup on unmount
        return () => {
            console.log('🔌 Cleaning up socket connection')
            socket.emit('leave-room', { roomId, userId })
            socket.disconnect()
        }
    }, [roomId, userId])

    /**
     * Send an offer to a specific peer
     */
    const sendOffer = useCallback((targetUserId, offer) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('offer', {
                targetUserId,
                offer,
                fromUserId: userId
            })
        }
    }, [isConnected, userId])

    /**
     * Send an answer to a specific peer
     */
    const sendAnswer = useCallback((targetUserId, answer) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('answer', {
                targetUserId,
                answer,
                fromUserId: userId
            })
        }
    }, [isConnected, userId])

    /**
     * Send ICE candidate to a specific peer
     */
    const sendIceCandidate = useCallback((targetUserId, candidate) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('ice-candidate', {
                targetUserId,
                candidate,
                fromUserId: userId
            })
        }
    }, [isConnected, userId])

    /**
     * Subscribe to signaling events
     */
    const onOffer = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('offer', callback)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off('offer', callback)
            }
        }
    }, [])

    const onAnswer = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('answer', callback)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off('answer', callback)
            }
        }
    }, [])

    const onIceCandidate = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('ice-candidate', callback)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off('ice-candidate', callback)
            }
        }
    }, [])

    const onUserJoined = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('user-joined', callback)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off('user-joined', callback)
            }
        }
    }, [])

    const onUserLeft = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('user-left', callback)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off('user-left', callback)
            }
        }
    }, [])

    return {
        socket: socketRef.current,
        isConnected,
        error,
        participants,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        onOffer,
        onAnswer,
        onIceCandidate,
        onUserJoined,
        onUserLeft
    }
}
