/**
 * Video Call Signaling Server
 * 
 * This is the main server file that handles:
 * 1. Express HTTP server for health checks
 * 2. Socket.IO for real-time WebRTC signaling
 * 
 * The server acts as a signaling relay - it doesn't handle
 * any video/audio data. All media flows directly P2P via WebRTC.
 * 
 * Socket Events:
 * - join-room: User joins a room
 * - leave-room: User leaves a room
 * - offer: WebRTC offer from one peer to another
 * - answer: WebRTC answer in response to an offer
 * - ice-candidate: ICE candidate for NAT traversal
 */

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import {
    getOrCreateRoom,
    addParticipant,
    removeParticipant,
    removeParticipantBySocketId,
    getParticipantSocketId,
    getStats
} from './roomManager.js'

// ========================================
// Configuration
// ========================================

// Port to listen on (use environment variable for production)
const PORT = process.env.PORT || 3001

// Allowed origins for CORS
// In production, replace with your actual frontend URL
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ========================================
// Express Setup
// ========================================

const app = express()

// Enable CORS for all routes
app.use(cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
}))

// Parse JSON bodies
app.use(express.json())

// Health check endpoint
// Useful for deployment platforms like Render to verify the server is running
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Video Call Signaling Server',
        ...getStats()
    })
})

// ========================================
// HTTP Server & Socket.IO Setup
// ========================================

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    // Transport configuration
    transports: ['websocket', 'polling'],
    // Ping settings for connection health
    pingTimeout: 60000,
    pingInterval: 25000
})

// ========================================
// Socket.IO Event Handlers
// ========================================

io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`)

    // ----------------------------------------
    // Room: Join
    // ----------------------------------------
    socket.on('join-room', ({ roomId, userId, name }) => {
        console.log(`📥 Join request: user ${userId} -> room ${roomId}`)

        // Validate input
        if (!roomId || !userId) {
            socket.emit('room-error', { message: 'Invalid room ID or user ID' })
            return
        }

        // Add participant to room
        const result = addParticipant(roomId, {
            odId: userId,
            name: name || `User ${userId.substring(0, 4)}`,
            socketId: socket.id
        })

        if (!result.success) {
            // Room is full
            socket.emit('room-full')
            return
        }

        // Join the Socket.IO room (for broadcasting)
        socket.join(roomId)

        // Store room and user info on socket for cleanup
        socket.data.roomId = roomId
        socket.data.odId = userId

        // Send room info back to the joining user
        socket.emit('room-joined', {
            participants: result.participants
        })

        // Notify other participants that someone joined
        socket.to(roomId).emit('user-joined', {
            odId: userId,
            name: name || `User ${userId.substring(0, 4)}`
        })

        console.log(`✅ User ${userId} joined room ${roomId}`)
    })

    // ----------------------------------------
    // Room: Leave
    // ----------------------------------------
    socket.on('leave-room', ({ roomId, userId }) => {
        console.log(`📤 Leave request: user ${userId} <- room ${roomId}`)

        if (!roomId || !userId) return

        // Remove from room
        removeParticipant(roomId, userId)

        // Leave Socket.IO room
        socket.leave(roomId)

        // Notify others
        socket.to(roomId).emit('user-left', { odId: userId })

        console.log(`✅ User ${userId} left room ${roomId}`)
    })

    // ----------------------------------------
    // WebRTC Signaling: Offer
    // ----------------------------------------
    socket.on('offer', ({ targetUserId, offer, fromUserId }) => {
        console.log(`📞 Offer: ${fromUserId} -> ${targetUserId}`)

        const roomId = socket.data.roomId
        if (!roomId) return

        // Find the target user's socket
        const targetSocketId = getParticipantSocketId(roomId, targetUserId)

        if (targetSocketId) {
            // Send offer directly to target user
            io.to(targetSocketId).emit('offer', {
                fromUserId,
                offer
            })
        }
    })

    // ----------------------------------------
    // WebRTC Signaling: Answer
    // ----------------------------------------
    socket.on('answer', ({ targetUserId, answer, fromUserId }) => {
        console.log(`📞 Answer: ${fromUserId} -> ${targetUserId}`)

        const roomId = socket.data.roomId
        if (!roomId) return

        const targetSocketId = getParticipantSocketId(roomId, targetUserId)

        if (targetSocketId) {
            io.to(targetSocketId).emit('answer', {
                fromUserId,
                answer
            })
        }
    })

    // ----------------------------------------
    // WebRTC Signaling: ICE Candidate
    // ----------------------------------------
    socket.on('ice-candidate', ({ targetUserId, candidate, fromUserId }) => {
        console.log(`🧊 ICE: ${fromUserId} -> ${targetUserId}`)

        const roomId = socket.data.roomId
        if (!roomId) return

        const targetSocketId = getParticipantSocketId(roomId, targetUserId)

        if (targetSocketId) {
            io.to(targetSocketId).emit('ice-candidate', {
                fromUserId,
                candidate
            })
        }
    })

    // ----------------------------------------
    // Disconnect Handler
    // ----------------------------------------
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Disconnected: ${socket.id} (${reason})`)

        // Remove user from their room
        const result = removeParticipantBySocketId(socket.id)

        if (result) {
            // Notify remaining participants
            socket.to(result.roomId).emit('user-left', { odId: result.odId })
            console.log(`🧹 Cleaned up user ${result.odId} from room ${result.roomId}`)
        }
    })
})

// ========================================
// Start Server
// ========================================

httpServer.listen(PORT, () => {
    console.log(`
  🚀 Video Call Signaling Server
  ================================
  🌐 Server running on port ${PORT}
  🔗 Health check: http://localhost:${PORT}
  📡 Socket.IO ready for connections
  🏠 Allowed origin: ${CLIENT_URL}
  ================================
  `)
})

// ========================================
// Graceful Shutdown
// ========================================

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down...')
    httpServer.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
    })
})

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down...')
    httpServer.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
    })
})
