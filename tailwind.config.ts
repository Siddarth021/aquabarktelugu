import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aquabark: {
          primary: "#A8D5B5",
          secondary: "#DDF1E3",
          accent: "#70B98A",
          dark: "#214D36",
          darker: "#163424",
          bg: "#F8FCF9",
          card: "#FFFFFF",
          text: "#26352B",
          muted: "#718078",
          border: "#E2ECE5",
          terracotta: "#A36D4C",
          terracottaHover: "#8E5C3D",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-jakarta)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(33, 77, 54, 0.05), 0 2px 6px -1px rgba(33, 77, 54, 0.03)",
        card: "0 10px 30px -5px rgba(33, 77, 54, 0.06)",
        hover: "0 20px 40px -10px rgba(33, 77, 54, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;

