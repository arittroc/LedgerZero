import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        glass: "var(--glass)",
        "glass-border": "var(--glass-border)",
        success: "var(--success)",
        "success-soft": "var(--success-soft)",
        "success-border": "var(--success-border)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        custom: "var(--shadow-custom)",
      },
    },
  },
  plugins: [],
} satisfies Config;
