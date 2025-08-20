import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#ffffff",
        },
      },
      boxShadow: {
        card: "0 10px 40px rgba(0,0,0,0.06)",
      },
    },
  },
};

export default config;
