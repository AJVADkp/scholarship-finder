import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F8EF7',
          dark: '#3a7ae0',
          light: '#E8F4FD',
        },
        success: {
          DEFAULT: '#34C48B',
          light: '#E8F8F2',
        },
        sky: {
          glass: '#E8F4FD',
        },
        mint: {
          glass: '#E8F8F2',
        },
        lavender: {
          glass: '#F0EEFF',
        },
        category: {
          merit: '#4F8EF7',
          'need-based': '#34C48B',
          sports: '#F59E0B',
          research: '#8B5CF6',
          government: '#EF4444',
          international: '#06B6D4',
        },
      },
      borderRadius: {
        card: '18px',
        pill: '999px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 38, 135, 0.08)',
        'glass-lg': '0 16px 48px rgba(31, 38, 135, 0.14)',
        card: '0 4px 20px rgba(31, 38, 135, 0.08)',
      },
      backgroundImage: {
        'page-gradient':
          'radial-gradient(ellipse at 20% 20%, #dbeafe 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #d1fae5 0%, transparent 50%)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'hero-float': 'heroFloat 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        heroFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

export default config
