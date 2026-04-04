/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080810',
        surface: '#0f0f1a',
        border:  '#1a1a2e',
        primary: '#00ff88',
        cyan:    '#06b6d4',
        purple:  '#7c3aed',
        muted:   '#4a4a6a',
        text:    '#e2e8f0',
        dim:     '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px #00ff8844, 0 0 20px #00ff8822' },
          to:   { boxShadow: '0 0 20px #00ff8888, 0 0 60px #00ff8844' },
        },
      },
    },
  },
  plugins: [],
};
