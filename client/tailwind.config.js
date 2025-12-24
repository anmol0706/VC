/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Enable dark mode by default (class-based for manual toggling if needed)
    darkMode: 'class',
    theme: {
        extend: {
            // Custom colors for our dark theme
            colors: {
                // Primary dark background colors
                dark: {
                    100: '#1a1a2e', // Lighter dark
                    200: '#16162a', // Medium dark
                    300: '#0f0f1a', // Deep dark (main background)
                    400: '#0a0a12', // Darkest
                },
                // Accent colors
                accent: {
                    blue: '#3b82f6',
                    green: '#22c55e',
                    red: '#ef4444',
                    orange: '#f97316',
                }
            },
            // Safe area padding for mobile devices with notches
            padding: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            // Minimum touch target sizes (48px recommended by accessibility guidelines)
            minWidth: {
                'touch': '48px',
            },
            minHeight: {
                'touch': '48px',
            },
            // Custom animations
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
