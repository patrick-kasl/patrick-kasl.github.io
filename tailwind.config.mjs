/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // --- ADD YOUR THEME VALUES HERE ---

      // 1. Add your colors
      colors: {
        primary: 'hsl(var(--theme-hue), 20%, 8%)',
        'primary-foreground': 'hsl(var(--theme-hue), 100%, 92%)',
        secondary: 'hsl(var(--theme-hue), 40%, 12%)',
        accent: 'hsl(var(--theme-hue), 100%, 50%)',
        edge: 'hsl(var(--theme-hue), 30%, 18%)',
      },

      // 2. Add your font families
      fontFamily: {
        primary: ['Rajdhani', 'system-ui'],
      },

      // 3. Add your other values
      borderRadius: {
        interactive: '0.4rem', // Becomes .rounded-interactive
      },
      transitionDuration: {
        interactive: '200ms', // Becomes .duration-interactive
      },

      // --- END OF YOUR THEME VALUES ---
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}