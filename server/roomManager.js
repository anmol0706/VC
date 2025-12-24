/**
 * Room Manager
 * 
 * Manages the state of all video call rooms.
 * Handles room creation, participant tracking, and cleanup.
 * 
 * Data structure:
 * rooms = Map<roomId, {
 *   id: string,
 *   participants: Map<odId, { odId, name, socketId }>,
 *   createdAt: Date
 * }>
 */

// Store all active rooms
// Using Map for O(1) lookups
const rooms = new Map()

// Maximum participants per room
const MAX_PARTICIPANTS = 4

/**
 * Create a new room or get existing one
 * @param {string} roomId - Unique room identifier
 * @returns {object} Room object
 */
export function getOrCreateRoom(roomId) {
    if (!rooms.has(roomId)) {
        // Create new room
        rooms.set(roomId, {
            id: roomId,
            participants: new Map(),
            createdAt: new Date()
        })
        console.log(`🏠 Created room: ${roomId}`)
    }

    return rooms.get(roomId)
}

/**
 * Check if a room exists
 * @param {string} roomId - Room to check
 * @returns {boolean}
 */
export function roomExists(roomId) {
    return rooms.has(roomId)
}

/**
 * Add a participant to a room
 * @param {string} roomId - Room to join
 * @param {object} participant - { odId, name, socketId }
 * @returns {object} { success, error?, participants? }
 */
export function addParticipant(roomId, participant) {
    const room = getOrCreateRoom(roomId)

    // Check if room is full
    if (room.participants.size >= MAX_PARTICIPANTS) {
        return {
            success: false,
            error: 'Room is full'
        }
    }

    // Check if user is already in the room
    if (room.participants.has(participant.odId)) {
        // Update existing participant (reconnection)
        room.participants.set(participant.odId, participant)
        console.log(`🔄 User reconnected: ${participant.odId} in room ${roomId}`)
    } else {
        // Add new participant
        room.participants.set(participant.odId, participant)
        console.log(`👋 User joined: ${participant.odId} in room ${roomId}`)
    }

    // Return list of all participants (for the joining user)
    return {
        success: true,
        participants: getParticipantsList(roomId)
    }
}

/**
 * Remove a participant from a room
 * @param {string} roomId - Room to leave
 * @param {string} odId - User ID to remove
 */
export function removeParticipant(roomId, odId) {
    const room = rooms.get(roomId)

    if (!room) return

    room.participants.delete(odId)
    console.log(`👋 User left: ${odId} from room ${roomId}`)

    // Clean up empty rooms
    if (room.participants.size === 0) {
        rooms.delete(roomId)
        console.log(`🗑️ Deleted empty room: ${roomId}`)
    }
}

/**
 * Remove a participant by socket ID
 * Called when socket disconnects
 * @param {string} socketId - Socket ID of disconnected user
 * @returns {object|null} { roomId, odId } if found, null otherwise
 */
export function removeParticipantBySocketId(socketId) {
    for (const [roomId, room] of rooms) {
        for (const [odId, participant] of room.participants) {
            if (participant.socketId === socketId) {
                removeParticipant(roomId, odId)
                return { roomId, odId }
            }
        }
    }
    return null
}

/**
 * Get list of participants in a room
 * @param {string} roomId - Room ID
 * @returns {array} Array of participant objects
 */
export function getParticipantsList(roomId) {
    const room = rooms.get(roomId)

    if (!room) return []

    return Array.from(room.participants.values()).map(p => ({
        odId: p.odId,
        name: p.name
    }))
}

/**
 * Get a specific participant's socket ID
 * Used for sending targeted signaling messages
 * @param {string} roomId - Room ID
 * @param {string} odId - User ID
 * @returns {string|null} Socket ID or null
 */
export function getParticipantSocketId(roomId, odId) {
    const room = rooms.get(roomId)

    if (!room) return null

    const participant = room.participants.get(odId)
    return participant?.socketId || null
}

/**
 * Get room statistics (for debugging/monitoring)
 * @returns {object} { roomCount, totalParticipants }
 */
export function getStats() {
    let totalParticipants = 0

    for (const room of rooms.values()) {
        totalParticipants += room.participants.size
    }

    return {
        roomCount: rooms.size,
        totalParticipants
    }
}

/**
 * Clean up old empty rooms
 * Call periodically to prevent memory leaks
 */
export function cleanupEmptyRooms() {
    const now = Date.now()
    const MAX_AGE = 60 * 60 * 1000 // 1 hour

    for (const [roomId, room] of rooms) {
        // Delete empty rooms older than MAX_AGE
        if (room.participants.size === 0 && (now - room.createdAt.getTime()) > MAX_AGE) {
            rooms.delete(roomId)
            console.log(`🗑️ Cleaned up old room: ${roomId}`)
        }
    }
}

// Run cleanup every 10 minutes
setInterval(cleanupEmptyRooms, 10 * 60 * 1000)
