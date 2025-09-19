/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Agrisa brand colors - sync với Gluestack
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
        agrisa: {
          green: "#059669",
          orange: "#ea580c",
          blue: "#0ea5e9",
        },
      },
      fontFamily: {
        heading: ["BricolageGrotesque-SemiBold"],
        body: ["BricolageGrotesque-Regular"],
        medium: ["BricolageGrotesque-Medium"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};
