module.exports = {
  important: ".json-viewer-tailwind",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Important to avoid style conflicts
  },
};
