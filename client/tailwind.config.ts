import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.12)",
        glow: "0 24px 80px rgba(20, 184, 166, 0.22)"
      },
      colors: {
        ink: "#111827",
        sea: "#0f766e",
        flame: "#f97316",
        berry: "#be123c",
        cobalt: "#2563eb"
      }
    }
  },
  plugins: []
} satisfies Config;
