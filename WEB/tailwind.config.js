/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f6efe4",
        paper: "rgba(255, 255, 255, 0.78)",
        ink: "#132c2a",
        leaf: "#1f5d52",
        amber: "#f4b545",
      },
    },
  },
  plugins: [],
};

