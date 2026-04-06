import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,js,ts}', './server/**/*.{js,ts}', './nuxt.config.{js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        'primary-hover': 'var(--primary-hover-color)',
        'primary-06': 'var(--primary-color-06)',
        'primary-03': 'var(--primary-color-03)',
        text: 'var(--text-color)',
        secondary: 'var(--secondary-color)',
        mute: 'var(--mute-color)',
        'mute-bg': 'var(--mute-bg-color)',
        card: 'var(--card-color)',
        header: 'var(--header-color)',
        bg: 'var(--bg-color)',
        active: 'var(--active-color)',
        border: 'var(--border-color)',
        tertiary: 'var(--tertiary-color)',
        'hover-shallow': 'var(--shallow-hover-bg-color)',
        'hover-deep': 'var(--deep-hover-bg-color)',
        'active-shallow': 'var(--shallow-active-bg-color)',
        'active-deep': 'var(--deep-active-bg-color)',
      },
      spacing: {
        header: '80px',
        page: '40px',
        gap: '8px',
      },
      fontSize: {
        '2xs': '11px',
        xs: '12px',
        sm: '14px',
        body: '16px',
        title: '20px',
        h1: '28px',
      },
      borderRadius: {
        'card-sm': '6px',
        card: '8px',
        'card-lg': '12px',
        'card-xl': '16px',
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config
