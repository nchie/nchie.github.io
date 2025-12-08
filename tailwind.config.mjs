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
          accent: "#0ea5e9",
          neutral: "#1c1c1c",
          "base-100": "#fdfcf8",
          "base-200": "#f7f5ee",
          "base-300": "#e6e1d9",
          info: "#38bdf8",
          success: "#16a34a",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "emerald",
    ],
  },
};
