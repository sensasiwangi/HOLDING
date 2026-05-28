import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0f7b63",
        "brand-2": "#12a77f",
      },
    },
  },
  plugins: [],
};

export default config;
