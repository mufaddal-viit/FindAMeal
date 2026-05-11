/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode
        sand: "#f6efe4",
        paper: "rgba(255, 255, 255, 0.78)",
        ink: "#132c2a",
        leaf: "#1f5d52",
        amber: "#f4b545",
        // Modern Gen-Z colors
        accent: "#ff6b6b",
        success: "#51cf66",
        warning: "#ffd93d",
      },
      backgroundColor: {
        light: {
          base: "#f6efe4",
          card: "rgba(255, 255, 255, 0.78)",
          alt: "#ffffff",
        },
        dark: {
          base: "#0f1419",
          card: "#1a1f27",
          alt: "#242b34",
        },
      },
      textColor: {
        light: {
          primary: "#132c2a",
          secondary: "#1f5d52",
          muted: "rgba(31, 93, 82, 0.6)",
        },
        dark: {
          primary: "#f0f4f8",
          secondary: "#a8d5ce",
          muted: "rgba(168, 213, 206, 0.5)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

