import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      colors: {
        page: '#FFFFFF',
        subtle: '#FAFAFA',
        muted: '#F4F4F5',
        hov: '#F0F0F1',
        active: '#E4E4E7',
        brd: { DEFAULT: '#E4E4E7', subtle: '#F0F0F1', hover: '#D4D4D8' },
        txt: {
          1: '#09090B',
          2: '#3F3F46',
          3: '#71717A',
          4: '#A1A1AA',
          ghost: '#D4D4D8',
        },
        brand: { DEFAULT: '#2C2C2E', hover: '#1C1C1E', light: '#F5F5F5', border: '#D4D4D4' },
        ok: { DEFAULT: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
        warn: { DEFAULT: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
        err: { DEFAULT: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
        dk: { DEFAULT: '#0C0C0E', card: '#161618', border: 'rgba(255,255,255,0.08)', text1: '#F4F4F5', text2: '#A1A1AA', text3: '#71717A' },
        code: { bg: '#1E1E20', text: '#D4D4D8', keyword: '#C084FC', string: '#86EFAC', tag: '#7DD3FC', attr: '#FCA5A5', comment: '#52525B' },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04)',
        hover: '0 2px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
} satisfies Config
