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
        gris: "#f3f3f3",
        negro: "#1d2a2a",
        morado: "#4e4ebd",
        "morado-100": "#2e2e67",
        red: {
          DEFAULT: "#ff0000",
          dark: "#bd1e26",
        },
        blue: {
          DEFAULT: "#155dfc",
          dark: "#0e358a",
        },
        green: {
          DEFAULT: "#00a63e",
          dark: "#01722b",
        },
        grey: {
          DEFAULT: "#4a5565",
          dark: "#282d35",
        },
      },
      borderRadius: {
        selector: "1rem",
        field: "2rem",
        box: "3rem",
        DEFAULT: "1.5rem",
        lg: "1rem",
      },
      borderWidth: {
        DEFAULT: "2px",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      fontWeight: {
        medium: 500,
        bold: 700,
      },
    },
  },
  plugins: [],
};
export default config;
