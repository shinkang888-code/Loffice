import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        loffice: {
          teal: "#1B7369",
          "teal-dark": "#145A52",
          "teal-light": "#2A9D8F",
          gold: "#B58233",
          "gold-light": "#D4A84B",
          silver: "#A8A9AD",
          dark: "#1A1A2E",
          surface: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        metal: "0 4px 20px rgba(27,115,105,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
