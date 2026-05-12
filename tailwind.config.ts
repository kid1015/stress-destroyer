/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 다크 베이스 (토스 감성 다크모드)
        void: {
          950: '#06060a',
          900: '#0d0d14',
          800: '#13131f',
          700: '#1a1a2e',
        },
        // 네온 액센트
        neon: {
          pink: '#ff2d78',
          purple: '#b347ff',
          blue: '#3d9eff',
          mint: '#00e5b0',
          yellow: '#ffe033',
          orange: '#ff6b2d',
        },
        // 종이색
        paper: {
          white: '#fafaf7',
          cream: '#f5f0e8',
          lined: '#e8e4dc',
        },
        // UI
        surface: {
          DEFAULT: '#1a1a2e',
          raised: '#22223a',
          overlay: '#2a2a45',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        handwrite: ['var(--font-handwrite)', 'cursive'],
      },
      animation: {
        'shred-fall': 'shredFall 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'shake': 'shake 0.5s ease-in-out',
        'float-up': 'floatUp 3s ease-in-out infinite',
        'rocket-launch': 'rocketLaunch 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'explode': 'explode 0.6s ease-out forwards',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'paper-insert': 'paperInsert 0.6s ease-in forwards',
        'vibrate': 'vibrate 0.1s linear infinite',
        'star-appear': 'starAppear 0.3s ease-out forwards',
      },
      keyframes: {
        shredFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(200px) rotate(720deg)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px) rotate(-2deg)' },
          '40%': { transform: 'translateX(8px) rotate(2deg)' },
          '60%': { transform: 'translateX(-6px) rotate(-1deg)' },
          '80%': { transform: 'translateX(6px) rotate(1deg)' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        rocketLaunch: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '20%': { transform: 'translateY(20px) scale(0.95)', opacity: '1' },
          '100%': { transform: 'translateY(-120vh) scale(0.3)', opacity: '0' },
        },
        explode: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(3)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(179, 71, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(179, 71, 255, 0.7), 0 0 80px rgba(179, 71, 255, 0.3)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        paperInsert: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(60px)', opacity: '0' },
        },
        vibrate: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
        starAppear: {
          '0%': { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 45, 120, 0.5)',
        'neon-purple': '0 0 20px rgba(179, 71, 255, 0.5)',
        'neon-blue': '0 0 20px rgba(61, 158, 255, 0.5)',
        'neon-mint': '0 0 20px rgba(0, 229, 176, 0.5)',
        'paper': '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)',
        'deep': '0 24px 64px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
