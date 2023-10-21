/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
// Primary Colour: #3803FF

const isDev = process.env.NODE_ENV === "development";
const devSafeList = [
  {
    pattern: /./,
  },
];

const config = {
  mode: "jit",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#3803FF",
      },
    },
  },
  prefix: "tw-",
  plugins: [],
  safelist: isDev ? devSafeList : [],
  corePlugins: {
    preflight: false,
  },
};

export default config;
