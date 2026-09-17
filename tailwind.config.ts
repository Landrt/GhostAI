import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F6F3",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#211D1A",
          quiet: "#6B6660",
        },
        line: "#DEDAD1",
        secondary: {
          DEFAULT: "#127749",
          light: "#E7F1EC",
          hover: "#0F653E",
          dark: "#0A462B",
        },
        mark: {
          DEFAULT: "#127749",
          light: "#E7F1EC",
        },
        confirm: "#127749",
        warn: "#A77B35",
        danger: "#B54A4A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        input: "8px",
        card: "12px",
        modal: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
