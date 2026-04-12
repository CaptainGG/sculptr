import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#6961ff",
        panel: "#1e1e2e",
        toolbar: "#1a1a2e",
        accent: "#4f46e5",
      },
    },
  },
  plugins: [],
};

export default config;
