module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          base: "#090d16",
          surface: "#0f172a",
          card: "rgba(15, 23, 42, 0.75)",
          border: "rgba(51, 65, 85, 0.6)",
        },
        brand: {
          cyan: "#22d3ee",
          indigo: "#6366f1",
          violet: "#8b5cf6",
          pink: "#ec4899",
        },
      },
      backgroundImage: {
        'accent-gradient': "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
        'violet-gradient': "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        'glass-gradient': "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
      },
      fontFamily: {
        display: ["'Share Tech Mono'", "monospace"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
};

