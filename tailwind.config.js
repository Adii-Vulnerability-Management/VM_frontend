/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/globalcomponents/**/*.{js,ts,jsx,tsx,mdx}"  // Add this line
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        scrollbar: ['rounded'], // Optional: Adds rounded scrollbar support
        primary: '#007ACC',  // Main blue color
        secondary: '#4CAF50',  // Secondary green color
        danger: '#FF5722',  // Red-orange for danger
        'sidebar-bg': '#050038',  // Sidebar background color
        'heading-primary': '#050038',  // Dark heading color
        'heading-secondary': '#333333',  // Sub-heading color
        'tab-active': '#007ACC',  // Active tab background color
        'tab-hover': '#005A99',  // Hover color for active tabs
        'page-bg': '#F4F4F9',  // Light page background color
        'card-bg': '#F8F9FA',  // Card/accordion background
        'text-primary': '#333333',  // Primary text color
        'text-secondary': '#757575',  // Secondary text color
      },
      fontFamily: {
        heading: ['Lato', 'sans-serif'],  // Heading font
        body: ['Roboto', 'sans-serif'],   // Body font
      },
      boxShadow: {
        't-lg': '0 -4px 10px rgba(0, 0, 0, 0.1)', // Add custom top shadow
        'b-lg': '0 4px 10px rgba(0, 0, 0, 0.1)',  // Custom bottom shadow

      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeOut: { '0%': { opacity: 1 }, '100%': { opacity: 0 } },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: 0, transform: 'translateX(-6px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideLeft: {
          '0%': { opacity: 0, transform: 'translateX(6px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 4px rgba(63, 32, 115, 0.20)' },
          '50%': { boxShadow: '0 0 0 6px rgba(63, 32, 115, 0.35)' },
          '100%': { boxShadow: '0 0 0 4px rgba(63, 32, 115, 0.20)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out forwards',
        'fade-out': 'fadeOut 200ms ease-in forwards',
        'scale-in': 'scaleIn 160ms ease-out forwards',
        'slide-up': 'slideUp 160ms ease-out forwards',
        'slide-left': 'slideLeft 160ms ease-out forwards',
        'slide-right': 'slideRight 160ms ease-out forwards',
        glow: 'glow 1200ms ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'), // Add the scrollbar plugin
  ],
};
