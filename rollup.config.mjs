import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const src = 'app/src/main.mjs';

const dev = {
  input: src,
  output: {
    file: 'app/js/script.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [nodeResolve(), commonjs()]
};


export default [dev];
