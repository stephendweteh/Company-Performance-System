/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:       { DEFAULT: '#3C50E0', light: '#EEF2FF' },
        sidebar:       '#1C2434',
        'sidebar-dark':'#111928',
        'sidebar-hover':'#313D4A',
        stroke:        '#E2E8F0',
        strokedark:    '#2E3A47',
        bodydark:      '#AEB7C0',
        bodydark1:     '#DEE4EE',
        graydark:      '#333A48',
        'meta-3':      '#10B981',
        'meta-4':      '#313D4A',
        'meta-5':      '#259AE6',
        success:       '#219653',
        danger:        '#D34053',
        warning:       '#FFA70B',
        whiten:        '#F1F5F9',
        'gray-2':      '#F7F9FC',
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '13':  '3.25rem',
      },
      boxShadow: {
        tailadmin: '0px 8px 13px -3px rgba(0,0,0,0.07)',
        card:      '0px 1px 3px rgba(0,0,0,0.12)',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
    },
  },
  plugins: [],
}
