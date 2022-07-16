import {terser} from "rollup-plugin-terser";
import node from "@rollup/plugin-node-resolve";
import * as meta from "./package.json";


const config = {
  input: "src/index.js",
  external: Object.keys(meta.dependencies || {}),
  output: {
    file: `dist/${meta.name}.js`,
    name: "fact",
    format: "umd",
    indent: true,
    sourcemap: true,
    extend: true,
    globals: {d3:'d3', 'lodash-es':'_'}
  },
  plugins: [
    node()
  ]
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.name}.min.js`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
];