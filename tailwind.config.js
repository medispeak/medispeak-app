/** @type {import('tailwindcss').Config} */

const config = {
  mode: "jit",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  prefix: "tw-",
  plugins: [],
  safelist: [
    {
      pattern: /./,
    },
  ],
  corePlugins: {
    preflight: false,
  },
};

export default config;
