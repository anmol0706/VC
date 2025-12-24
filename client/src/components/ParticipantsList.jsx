/**
 * ParticipantsList Component
 * 
 * Slide-up panel showing all participants in the room.
 * 
 * Features:
 * - Shows participant names and mute status
 * - Indicates the current user (You)
 * - Copy room link button
 * - Close button to dismiss
 */

function ParticipantsList({
    participants,
    localUserId,
    roomId,
    isOpen,
    onClose
}) {
    /**
     * Copy room link to clipboard
     */
    const handleCopyLink = async () => {
        const roomUrl = `${window.location.origin}/room/${roomId}`
        try {
            await navigator.clipboard.writeText(roomUrl)
            // Could add a toast notification here
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (!isOpen) return null

    // Combine local user with remote participants
    const allParticipants = [
        { odId: localUserId, name: 'You', isLocal: true },
        ...participants
    ]

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-bottom">
                <div className="bg-dark-200 rounded-t-3xl max-h-[60vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h2 className="text-lg font-semibold">
                            Participants ({allParticipants.length})
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-dark-100 flex items-center justify-center
                         active:scale-95 transition-transform"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Participant List */}
                    <div className="overflow-y-auto max-h-[40vh] p-4 space-y-2">
                        {allParticipants.map(participant => (
                            <div
                                key={participant.odId}
                                className="flex items-center gap-3 p-3 rounded-xl bg-dark-100"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                flex items-center justify-center text-white font-semibold">
                                    {(participant.name || 'P').charAt(0).toUpperCase()}
                                </div>

                                {/* Name */}
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {participant.name || 'Participant'}
                                        {participant.isLocal && (
                                            <span className="ml-2 text-xs text-blue-400">(You)</span>
                                        )}
                                    </p>
                                </div>

                                {/* Mute indicator */}
                                {participant.isMuted && (
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer - Copy Link */}
                    <div className="p-4 border-t border-white/10 safe-area-bottom">
                        <button
                            onClick={handleCopyLink}
                            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 
                         text-white font-medium rounded-xl
                         flex items-center justify-center gap-2
                         active:scale-[0.98] transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Room Link
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ParticipantsList
