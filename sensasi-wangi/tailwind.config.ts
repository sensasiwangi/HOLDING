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
        swi: {
          cream: "#FFF8F0",
          sand: "#F5E6D3",
          wood: "#8B6914",
          gold: "#D4A843",
          dark: "#2C1810",
          green: "#4A6741",
          floral: "#E8B4C8",
          citrus: "#F4C430",
          aquatic: "#7EB8DA",
          musk: "#C9B896",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
