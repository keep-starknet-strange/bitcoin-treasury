import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cash Sans", "sans-serif"],
        mono: ["Cash Sans Mono", "monospace"],
      },
      colors: {
        bgApp: "var(--background-app)",
        bgSubtle: "var(--background-subtle)",
        bgStandard: "var(--background-standard)",
        bgProminent: "var(--background-prominent)",

        borderSubtle: "var(--border-subtle)",
        borderStandard: "var(--border-standard)",

        textProminent: "var(--text-prominent)",
        textStandard: "var(--text-standard)",
        textSubtle: "var(--text-subtle)",
        textPlaceholder: "var(--text-placeholder)",

        iconProminent: "var(--icon-prominent)",
        iconStandard: "var(--icon-standard)",
        iconSubtle: "var(--icon-subtle)",
        iconExtraSubtle: "var(--icon-extra-subtle)",
        slate: "var(--slate)",
        blockTeal: "var(--block-teal)",
        blockOrange: "var(--block-orange)",
      },
      keyframes: {
        appearDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        flapDownTop: {
          from: { transform: "rotateX(0deg)" },
          "50%, to": { transform: "rotateX(90deg)" },
        },
        flapDownBottom: {
          "from, 50%": { transform: "rotateX(90deg)" },
          "90%": { transform: "rotateX(20deg)" },
          "80%, to": { transform: "rotateX(0deg)" },
        },
      },
      animation: {
        appearDown: "appearDown 250ms ease-in forwards",
        fadeIn: "fadeIn 250ms ease-in forwards 1s",
        flapDownTop: "flapDownTop 300ms ease-in forwards",
        flapDownBottom: "flapDownBottom 300ms ease-out forwards",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".clip-path-\\[polygon\\(0_50\\%\\,100\\%_50\\%\\,100\\%_0\\,0_0\\)\\]":
          {
            clipPath: "polygon(0 50%, 100% 50%, 100% 0, 0 0)",
          },
        ".clip-path-\\[polygon\\(0_100\\%\\,100\\%_100\\%\\,100\\%_50\\%\\,0_50\\%\\)\\]":
          {
            clipPath: "polygon(0 100%, 100% 100%, 100% 50%, 0 50%)",
          },
        ".rotate-x-50": {
          transform: "rotateX(50deg)",
        },
        ".shadow-inner-top": {
          boxShadow: "inset 0 -3px 5px -4px rgba(0, 0, 0, 0.2)",
        },
        ".shadow-inner-bottom": {
          boxShadow: "inset 0 3px 5px -4px rgba(0, 0, 0, 0.2)",
        },
        ".shadow-outer-bottom": {
          boxShadow: "0px 6px 6px 0px rgba(0, 0, 0, 0.8)",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
} satisfies Config;
