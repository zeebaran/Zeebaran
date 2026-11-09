import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: "#06642D", 700: "#06642D", 900: "#123B25" },
        orange: { DEFAULT: "#FE6901" },
        leaf: "#8CC63F",
        forest: "#123B25",
        cream: "#F7F5EA",
        ink: "#16271D",
        muted: "#5E6B62",
        line: "rgba(18,59,37,0.12)",
      },
      fontFamily: {
        mono: ["var(--font-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontSize: {
        // Qul scale: tight display headings, light small body, tiny tracked eyebrows
        display: [
          "clamp(2.5rem, 1.6rem + 3.6vw, 4.25rem)",
          { lineHeight: "1.04", letterSpacing: "-0.025em" },
        ],
        h2: [
          "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)",
          { lineHeight: "1.08", letterSpacing: "-0.022em" },
        ],
        h3: [
          "clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)",
          { lineHeight: "1.2", letterSpacing: "-0.012em" },
        ],
        lead: ["clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.65" }],
        small: ["0.875rem", { lineHeight: "1.55" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }],
      },
      borderRadius: { card: "1.125rem", panel: "2rem" },
      boxShadow: {
        card: "0 1px 2px rgba(18,59,37,0.04), 0 8px 28px -10px rgba(18,59,37,0.14)",
        lift: "0 2px 4px rgba(18,59,37,0.05), 0 22px 48px -16px rgba(18,59,37,0.22)",
      },
      maxWidth: { page: "76rem" },
      transitionTimingFunction: { out: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
};
export default config;
