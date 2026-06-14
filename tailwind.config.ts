import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        emeraude: {
          foret:   '#0D5934',
          DEFAULT: '#1B6B44',
          vif:     '#2A9D6E',
          clair:   '#E3F5EC',
        },
        saffron: {
          DEFAULT: '#F5A623',
          chaud:   '#E8700A',
          clair:   '#FEF0E0',
        },
        or: {
          DEFAULT: '#D4A017',
          clair:   '#FBF3D8',
        },
        cobalt:     '#1B4FD8',
        terracotta: '#C0392B',
        anthracite: '#1F2937',
        gris:       '#4B5563',
        fond:       '#F9FAFB',
        sep:        '#D1D5DB',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn:  '16px',
        pill: '99px',
      },
      boxShadow: {
        card:      '0 6px 22px rgba(13,41,28,.10), 0 1px 3px rgba(0,0,0,.05)',
        'card-or': '0 10px 30px rgba(212,160,23,.20)',
        cta:       '0 6px 16px rgba(245,166,35,.32)',
      },
      height: {
        'hero':       '260px',
        'header':     '64px',
        'navbar':     '72px',
        'cta':        '64px',
        'cover':      '86px',
        'hero-fiche': '160px',
      },
    },
  },
  plugins: [],
}

export default config
