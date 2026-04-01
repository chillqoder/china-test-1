import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#e8dfd0",
          300: "#d4c4a8",
          400: "#bfa17f",
          500: "#a8805c",
          600: "#96684a",
          700: "#7d533e",
          800: "#68453a",
          900: "#573d34",
        },
        ink: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#1a1a1a",
        },
        terracotta: {
          400: "#d4856a",
          500: "#c47055",
          600: "#b15d40",
          700: "#944d35",
        },
        amber: {
          300: "#f5c56d",
          400: "#f0b44a",
          500: "#e69d24",
        },
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
