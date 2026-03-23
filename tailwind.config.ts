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
        background: "#000000",
        surface: "#0a0a0a",
        card: "#0f0f12",
        border: "#1a1a1f",
        primary: "#7740d9",
        primary_glow: "rgba(119, 64, 217, 0.25)",
        primary_dim: "rgba(119, 64, 217, 0.08)",
        text_primary: "#ffffff",
        text_secondary: "#888899",
        text_muted: "#444455",
      },
      fontFamily: {
        syne: ["var(--font-syne)"],
        sans: ["var(--font-dm-sans)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        pulse_glow: "pulse_glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        pulse_glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
      },
    },
  },
  plugins: [],
};
export default config;