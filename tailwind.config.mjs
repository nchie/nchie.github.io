import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{astro,html,md,mdx,ts,tsx}", "./public/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Work Sans"', "system-ui", "-apple-system", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        blog: {
          primary: "#0f766e",
          "primary-content": "#ecfdf3",
          secondary: "#22c55e",
          "secondary-content": "#0f2c1b",
          accent: "#0ea5e9",
          "accent-content": "#05202e",
          neutral: "#1c1c1c",
          "neutral-content": "#f5f5f5",
          "base-100": "#fdfcf8",
          "base-200": "#f7f5ee",
          "base-300": "#e6e1d9",
          info: "#38bdf8",
          "info-content": "#041019",
          success: "#16a34a",
          "success-content": "#06200e",
          warning: "#f59e0b",
          "warning-content": "#2f1b02",
          error: "#ef4444",
          "error-content": "#2a0b0b",
        },
      },
      "emerald",
    ],
  },
};
