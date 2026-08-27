import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#08090b",
        panel: "#111214",
        line: "#25272b",
        acid: "#dcff52",
        round: "#dcff52",
        rest: "#63a9ff",
        danger: "#fb7185",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "Arial", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 55px rgba(215, 255, 63, 0.12)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.68" },
        },
      },
      animation: {
        "pulse-soft": "pulseSoft 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
