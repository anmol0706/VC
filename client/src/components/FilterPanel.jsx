/**
 * FilterPanel Component
 * 
 * Slide-up panel displaying available video filter options.
 * 
 * Features:
 * - Grid of filter preview thumbnails
 * - Active filter indicator
 * - Tap to select filter
 * - Smooth slide-up animation
 */

function FilterPanel({
    isOpen,
    onClose,
    filters,
    currentFilter,
    onSelectFilter
}) {
    if (!isOpen) return null

    const handleFilterSelect = (filterKey) => {
        onSelectFilter(filterKey)
        onClose()
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Panel */}
            <div className="filter-panel relative w-full max-w-lg bg-dark-200 rounded-t-3xl 
                            border-t border-white/10 animate-slide-in-bottom safe-area-bottom">
                {/* Handle bar */}
                <div className="flex justify-center py-3">
                    <div className="w-10 h-1 bg-white/30 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4">
                    <h3 className="text-lg font-semibold">Video Filters</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                                   hover:bg-white/20 transition-colors"
                        aria-label="Close filters"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Filter grid */}
                <div className="filter-grid px-6 pb-8">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => handleFilterSelect(filter.key)}
                            className={`filter-item ${currentFilter === filter.key ? 'filter-item-active' : ''}`}
                            aria-label={`Apply ${filter.name} filter`}
                        >
                            {/* Preview thumbnail */}
                            <div
                                className="filter-preview"
                                style={{ background: filter.preview }}
                            />
                            {/* Filter name */}
                            <span className="filter-name">{filter.name}</span>
                            {/* Active indicator */}
                            {currentFilter === filter.key && (
                                <div className="filter-check">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FilterPanel
