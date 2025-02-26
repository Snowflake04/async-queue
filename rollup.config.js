import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
  // ES module build
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.mjs",
      format: "esm",
    },
    plugins: [
      commonjs(),
      typescript({
        declarationDir: "dist/types",
      }),
      terser(),
    ],
  },
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.cjs.js",
      format: "cjs",
    },
    plugins: [
      commonjs(),
      typescript({
        declarationDir: "dist/types",
      }),
      terser(),
    ],
  },
  // Browser build (IIFE)
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.iife.js",
      format: "iife",
      name: "AsyncQueue", // Global variable name for the browser
    },
    plugins: [
      commonjs(),
      typescript({
        declarationDir: "dist/types",
      }),
      terser(),
    ],
  },
];
