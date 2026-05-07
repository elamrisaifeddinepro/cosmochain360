import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4f0',
          100: '#fbe6dc',
          200: '#f7ccb9',
          300: '#f1a88a',
          400: '#e87a54',
          500: '#e05a2b',
          600: '#c94420',
          700: '#a7361c',
          800: '#882f1e',
          900: '#6f2a1d',
          950: '#3c130b',
        },
        neutral: {
          50:  '#fafaf9',
          100: '#f5f4f2',
          200: '#e8e6e2',
          300: '#d3cfc9',
          400: '#b0a99f',
          500: '#8d8479',
          600: '#726960',
          700: '#5d5449',
          800: '#4c443b',
          900: '#403a31',
          950: '#221e18',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
export default config
