/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#04070d",
        graphite: "#0b111c",
        panel: "#101827",
        chrome: "#c8d0d8",
        signal: "#32ff9d",
        voltage: "#35a7ff",
        heat: "#ffb347",
      },
      boxShadow: {
        glow: "0 0 36px rgba(53, 167, 255, 0.22)",
        signal: "0 0 28px rgba(50, 255, 157, 0.18)",
      },
      fontFamily: {
        display: [
          "Inter Tight",
          "Aptos Display",
          "Arial Narrow",
          "system-ui",
          "sans-serif",
        ],
        body: ["Inter", "Aptos", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "control-grid":
          "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
        "panel-glow":
          "radial-gradient(circle at 25% 15%, rgba(53,167,255,.24), transparent 28%), radial-gradient(circle at 80% 12%, rgba(50,255,157,.13), transparent 24%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
      },
    },
  },
  plugins: [],
};
