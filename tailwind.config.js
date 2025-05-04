/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "league-spartan": ["League-Spartan"],
        "poppins-regular": ["Poppins-Regular"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-bold": ["Poppins-Bold"],
        "space-mono": ["SpaceMono"],
      },
      colors: {
        primary: "#445399", // Your custom colors
      },
    },
  },
  plugins: [],
}

