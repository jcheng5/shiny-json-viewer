const esbuild = require("esbuild");
const { typescriptPlugin } = require("esbuild-plugin-typescript");

esbuild
  .build({
    entryPoints: ["./src/JSONViewer.tsx"],
    bundle: true,
    outfile: "./dist/json-viewer.js",
    platform: "browser",
    target: "es2020",
    plugins: [typescriptPlugin()],
    loader: {
      ".css": "text", // This loads CSS files as strings
    },
    minify: process.env.NODE_ENV === "production",
  })
  .catch(() => process.exit(1));
