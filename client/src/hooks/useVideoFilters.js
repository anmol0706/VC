/**
 * useVideoFilters Hook
 * 
 * Manages video filter state for the local video feed.
 * 
 * Features:
 * - Multiple filter presets (grayscale, sepia, blur, etc.)
 * - CSS-based filters for performance
 * - Persists filter selection during camera switches
 */

import { useState, useMemo, useCallback } from 'react'

// Available filter presets
const FILTERS = {
    none: {
        name: 'None',
        style: {},
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    grayscale: {
        name: 'B&W',
        style: { filter: 'grayscale(100%)' },
        preview: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
    },
    sepia: {
        name: 'Sepia',
        style: { filter: 'sepia(70%)' },
        preview: 'linear-gradient(135deg, #d4a574 0%, #8b6914 100%)'
    },
    blur: {
        name: 'Soft',
        style: { filter: 'blur(1.5px)' },
        preview: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)'
    },
    brightness: {
        name: 'Bright',
        style: { filter: 'brightness(1.25)' },
        preview: 'linear-gradient(135deg, #fff6b7 0%, #f6416c 100%)'
    },
    contrast: {
        name: 'Vivid',
        style: { filter: 'contrast(1.3) saturate(1.2)' },
        preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    warm: {
        name: 'Warm',
        style: { filter: 'sepia(25%) saturate(1.3) brightness(1.1)' },
        preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    cool: {
        name: 'Cool',
        style: { filter: 'hue-rotate(180deg) saturate(0.7) brightness(1.1)' },
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    vintage: {
        name: 'Vintage',
        style: { filter: 'sepia(40%) contrast(0.9) brightness(1.1)' },
        preview: 'linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)'
    }
}

export function useVideoFilters() {
    // Current active filter key
    const [currentFilter, setCurrentFilter] = useState('none')

    // Get the list of available filters for display
    const availableFilters = useMemo(() => {
        return Object.entries(FILTERS).map(([key, value]) => ({
            key,
            name: value.name,
            preview: value.preview
        }))
    }, [])

    // Get the current filter's CSS style object
    const filterStyle = useMemo(() => {
        return FILTERS[currentFilter]?.style || {}
    }, [currentFilter])

    // Set the active filter
    const setFilter = useCallback((filterKey) => {
        if (FILTERS[filterKey]) {
            setCurrentFilter(filterKey)
        }
    }, [])

    // Check if a filter is currently active (not 'none')
    const hasActiveFilter = currentFilter !== 'none'

    return {
        currentFilter,
        filterStyle,
        availableFilters,
        setFilter,
        hasActiveFilter
    }
}
